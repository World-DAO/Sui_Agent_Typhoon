module tarven::agent
use 0x2::table;
use std::option;
use std::error;

const E_ALREADY_HAS_SESSION: u64 = 100;
const E_NO_ACTIVE_SESSION: u64 = 101;

/// 全局的“AI Agent”或“管理对象”，内部存一个 `Table<address, bool>` 用于跟踪用户是否在会话中
struct ChatManager has key, store {
    id: UID,
    active_sessions: table::Table<address, bool>,
    owner: address,
}

/// 会话对象
struct ChatSession has key, store {
    id: UID,
    user: address,
}

//-------------------------------------------------------------
/// 初始化ChatManager, 只需执行一次
//-------------------------------------------------------------
fun init_manager(ctx: &mut TxContext) {
    let t = table::new<address, bool>(ctx);
    let mgr = ChatManager {
        id: object::new(ctx),
        active_sessions: t,
    };
    
    transfer::share_object(t);
}

//-------------------------------------------------------------
/// 用户发起新会话: 先检查 "active_sessions" 里有没有此用户
//-------------------------------------------------------------
public fun start_chat(
    manager: &mut ChatManager,
    ctx: &mut TxContext
): ChatSession {
    let has_active = table::has_key(&manager.active_sessions, ctx.sender());
    if (has_active) {
        abort E_ALREADY_HAS_SESSION;
    }
    table::add(&mut manager.active_sessions, ctx.sender(), true);
    let session = ChatSession {
        id: object::new(ctx),
        user,
        finished: false,
    };
    transfer::public_transfer(session, manager.owner);
}

//-------------------------------------------------------------
/// 结束或完成会话(例如发放奖励后)
///  - user/AI/谁来调用, 看你需求; 
///  - 这里假设 user 自己必须finish
//-------------------------------------------------------------
public fun finish_chat(
    manager: &mut ChatManager,
    session: &mut ChatSession,
    amount: u64,
) {
    // 检查当前调用者 == session.user
    let ChatSession { id, user, finished } = session;
    let caller = tx_context::sender(manager);
    assert!(caller == session.user, E_NO_ACTIVE_SESSION);

    // 1) 标记 session.finished = true
    session.finished = true;

    // 2) 在table里把 user->true 移除
    //    这样 user下次可以 start_chat
    //    也可以 update user->false, depends on your design
    let existed = table::remove(&mut manager.active_sessions, caller);
    // remove returns an Option<bool>, 你可以 check it 
    // or just do "option::destroy(existed);" to ignore
    id.delete();
}

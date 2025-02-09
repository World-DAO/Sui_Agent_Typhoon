module tarven::agent;
use sui::bag;
use sui::event;
use sui::sui::SUI;
use sui::coin::{Self, Coin};
use tarven::bar::{mint, TokenInfo};
use sui::balance::{Self, Balance};
use std::string::String;

const E_ALREADY_HAS_SESSION: u64 = 100;
const E_NON_OWNER: u64 = 101;

public struct ChatManager has key, store {
    id: UID,
    active_sessions: bag::Bag,
    payment: Balance<SUI>,
    owner: address,
}

/// 会话对象
public struct ChatSession has key, store {
    id: UID,
    user: address,
    amount: u64,
}

public struct AgentNFT has key, store {
    id: UID,
    owner: address,
    url: String,
}

fun init(ctx: &mut TxContext) {
    let t = bag::new(ctx);
    let mgr = ChatManager {
        id: object::new(ctx),
        active_sessions: t,
        payment: balance::zero(),
        owner: ctx.sender(),
    };
    event::emit(ChatManagerInitialized {
        id: object::id(&mgr),
    });

    transfer::share_object(mgr);
}


public fun start_chat(
    manager: &mut ChatManager,
    ctx: &mut TxContext,
    pay: Coin<SUI>
) {
    let contain_check = bag::contains(&manager.active_sessions, ctx.sender());
    assert!(contain_check, E_ALREADY_HAS_SESSION);

    bag::add(&mut manager.active_sessions, ctx.sender(), true);
    let session = ChatSession {
        id: object::new(ctx),
        user: ctx.sender(),
        amount: coin::value(&pay)
    };
    coin::put(&mut manager.payment, pay);
    transfer::public_transfer(session, manager.owner);
}

public fun finish_chat(
    manager: &mut ChatManager,
    session: ChatSession,
    _amount: u64,
    url: String,
    ctx: &mut TxContext,
    info: &mut TokenInfo
) {
    // 检查当前调用者 == session.user
    let ChatSession {id, user, amount: _ } = session;
    assert!(ctx.sender() == manager.owner, E_NON_OWNER);

    let _existed: bool = bag::remove(&mut manager.active_sessions, user);

    mint(info, _amount, user, ctx);
    transfer::public_transfer(AgentNFT{
      id: object::new(ctx),
      owner: user,
      url,
    }, user);
    id.delete();
}

public struct ChatManagerInitialized has copy, drop {
  id: ID
}

#[test_only]
use sui::test_scenario::{Self as ts, Scenario};
#[test_only]
const ALICE: address = @0xA;
#[test_only]
const BOB: address = @0xB;

#[test_only]
fun test_coin(ts: &mut Scenario): Coin<SUI> {
		coin::mint_for_testing<SUI>(42, ts.ctx())
}

#[test]
fun test_chat_success() {
    let mut ts = ts::begin(@0x0);
    let c = test_coin(&mut ts);
    {
      ts.next_tx(ALICE);
    };
    ts.next_tx(@0x0);
    ts::end(ts);
}

#[test]
#[expected_failure(abort_code = E_NON_OWNER)]
fun test_chat_non_owner() {
    let mut ts = ts::begin(@0x0);
    let c = test_coin(&mut ts);

    ts::end(ts);
}

#[test]
#[expected_failure(abort_code = E_ALREADY_HAS_SESSION)]
fun test_chat_already_has_session() {
    let mut ts = ts::begin(@0x0);
    let c = test_coin(&mut ts);

    ts::end(ts);
}

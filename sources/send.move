module tarven::send;

use sui::{dynamic_object_field as dof, event};

const ERR_SENDER_NOT_MATCH: u64 = 101;
public struct SharedTransfer<phantom T: key + store> has key, store {
    id: UID,
    sender: address,
    recipient: address,
}

public struct TransferObjectKey has copy, store, drop {}

public fun create_transfer<T: key + store>(
    coin: T,
    recipient: address,
    ctx: &mut TxContext,
) {

    let mut transfer = SharedTransfer<T> {
      id: object::new(ctx),
      sender: ctx.sender(),
      recipient
    };
    event::emit(TransferCreated {
        tx_id: object::id(&transfer),
        sender: transfer.sender,
        recipient: transfer.recipient,
    });

    dof::add(&mut transfer.id, TransferObjectKey {}, coin);

    transfer::public_share_object(transfer);
}

public fun claim_transfer<T: key + store>(
    mut st: SharedTransfer<T>,
    ctx: &TxContext,
):T {
    let coin = dof::remove<TransferObjectKey, T>(&mut st.id, TransferObjectKey {});
    let SharedTransfer { id, sender:_, recipient } = st;
    assert!(recipient == ctx.sender(), ERR_SENDER_NOT_MATCH);
    event::emit(TransferClaimed {
        tx_id: id.to_inner()
    });
    id.delete();
    coin
}

public struct TransferCreated has copy, drop {
    tx_id: ID,
    sender: address,
    recipient: address,
}

public struct TransferClaimed has copy, drop {
    tx_id: ID,
}


#[test_only]
use sui::sui::SUI;
#[test_only]
use sui::test_scenario::{Self as ts, Scenario};
#[test_only]
use sui::coin::{Self,Coin};
#[test_only]
use sui::balance::Balance;
#[test_only]
const ALICE: address = @0xA;
#[test_only]
const BOB: address = @0xB;

/// 简单辅助函数：给测试铸造一笔 SUI (数量=42)
#[test_only]
fun test_coin(ts: &mut Scenario): Coin<SUI> {
		coin::mint_for_testing<SUI>(42, ts.ctx())
}

#[test]
fun test_create_transfer() {
    let mut ts = ts::begin(@0x0);
    let c = test_coin(&mut ts);
    create_transfer<Coin<SUI>>(c, BOB, ts.ctx());
    ts::end(ts);
}


#[test]
fun test_successful_claim() {
    let mut ts = ts::begin(@0x0);
    let c = test_coin(&mut ts);
    create_transfer<Coin<SUI>>(c, BOB, ts.ctx());

    {
        ts.next_tx(BOB);
        let st: SharedTransfer<Coin<SUI>> = ts.take_shared();
        let claimed = claim_transfer<Coin<SUI>>(st, ts.ctx());
        transfer::public_transfer(claimed, BOB);
    };
    ts.next_tx(@0x0);
    ts::end(ts);
}


#[test]
#[expected_failure(abort_code = ERR_SENDER_NOT_MATCH)]

fun test_unauthorized_claim() {
    let mut ts = ts::begin(@0x0);
    let c = test_coin(&mut ts);
    create_transfer<Coin<SUI>>(c, BOB, ts.ctx());
    {
      ts.next_tx(ALICE);
      let st: SharedTransfer<Coin<SUI>> = ts.take_shared();
      let claimed = claim_transfer<Coin<SUI>>(st, ts.ctx());
      transfer::public_transfer(claimed, ALICE);
    };

    abort 1337
}

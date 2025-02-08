module tarven::send;

use sui::coin::Coin;
use sui::{dynamic_object_field as dof, event};

const ERR_SENDER_NOT_MATCH: u64 = 101;
public struct SharedTransfer<phantom T: key + store> has key, store {
    id: UID,
    sender: address,
    recipient: address,
}

public struct TransferObjectKey has copy, store, drop {}

public fun create_transfer<T: key + store>(
    coin: Coin<T>,
    recipient: address,
    ctx: &TxContext,
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
) {
    let coin = dof::borrow_mut(&mut st.id, TransferObjectKey {});
    let SharedTransfer { id, sender, recipient } = st;
    assert!(sender == ctx.sender(), ERR_SENDER_NOT_MATCH);
    event::emit(TransferClaimed {
        tx_id: id.to_inner()
    });
    transfer::public_transfer(coin, recipient);
}

public struct TransferCreated has copy, drop {
    tx_id: ID,
    sender: address,
    recipient: address,
}

public struct TransferClaimed has copy, drop {
    tx_id: ID,
}


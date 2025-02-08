module tarven::my_token;

use 0x2::coin::{Self, Coin, TreasuryCap};
use std::option;
use std::string;
use std::error;

struct BAR has drop {}

struct TokenInfo has key, store {
    id: UID,
    current_supply: u64,
    treasury_cap: TreasuryCap<BAR>,
}

const DECIMALS: u8 = 6; 
const NAME: vector<u8> = b"BAR";
const SYMBOL: vector<u8> = b"BAR Token";

fun init(witness: BAR, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        DECIMALS,
        SYMBOL,
        NAME,
        b"The Only Official BAR Token",             // description
        option::none(),  // url or icon, optional
        ctx
    );

    transfer::public_freeze_object(metadata);

    let info = TokenInfo {
        id: object::new(ctx),
        current_supply: 0,
        treasury_cap: treasury,
    };

    transfer::public_transfer(info, ctx.sender());

}

// public entry fun mint(
//     info: &mut TokenInfo,
//     amount: u64,
//     ctx: &mut TxContext
// ): Coin<MY_TOKEN> {
//     // 1) 由 treasury_cap 执行 coin::mint
//     let coin_minted = coin::mint(&mut info.treasury_cap, amount, ctx);

//     // 2) 更新 current_supply
//     info.current_supply = info.current_supply + amount;

//     coin_minted
// }

public fun burn(
    info: &mut TokenInfo,
    to_burn: Coin<BAR>,
) {
    coin::burn(&mut info.treasury_cap, to_burn);
}

public fun read_supply(info: &TokenInfo): u64 {
    info.current_supply
}


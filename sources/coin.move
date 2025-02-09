module tarven::bar;

use sui::coin::{Self, Coin, TreasuryCap};

public struct BAR has drop {}

public struct TokenInfo has key, store {
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

public fun mint(
    info: &mut TokenInfo,
    amount: u64,
    to: address,
    ctx: &mut TxContext
) {
    info.current_supply = info.current_supply + amount;
    transfer::public_transfer(coin::mint(&mut info.treasury_cap, amount, ctx), to)
}


public fun burn(
    info: &mut TokenInfo,
    to_burn: Coin<BAR>,
) {
    coin::burn(&mut info.treasury_cap, to_burn);
}

public fun read_supply(info: &TokenInfo): u64 {
    info.current_supply
}

#[test_only]
use sui::sui::SUI;
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

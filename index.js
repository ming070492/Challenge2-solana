const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

/*
const newPair = Keypair.generate();
console.log(newPair);
*/

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        27, 102,  35, 215,  90, 212, 125, 115, 223,  80, 122,
        34, 184,   5,  77, 184, 195, 156,  55, 246,  46, 242,
        207,  79, 101, 120, 138, 248, 109, 115, 204,   9, 183,
        76,  96,  96,  63,  68, 134,  31,  43, 192,   6,  80,
        243, 160, 227, 252,   3, 135,   7, 193, 116, 229, 162,
        77,  98,  41,  58, 159, 247,  31, 162, 255
      ]            
);


const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    const to = Keypair.generate();
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    var fromWalletBalance = await connection.getBalance(
        new PublicKey(from._keypair.publicKey)
    );
    console.log(`Senders (from) Wallet Balance: ${parseInt(fromWalletBalance) / LAMPORTS_PER_SOL} SOL`);

    var halfBalance = fromWalletBalance / 2;

    var toWalletBalance = await connection.getBalance(
        new PublicKey(to._keypair.publicKey)
    );
    console.log(`Receivers (to) Wallet balance: ${parseInt(toWalletBalance) / LAMPORTS_PER_SOL} SOL`);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    
    // Aidrop 2 SOL to Sender wallet
    if(fromWalletBalance <= 0) {
        console.log("Airdopping some SOL to Sender wallet!");
        const fromAirDropSignature = await connection.requestAirdrop(
            new PublicKey(from.publicKey),
            2 * LAMPORTS_PER_SOL
        );

    // Latest blockhash (unique identifer of the block) of the cluster
        let latestBlockHash = await connection.getLatestBlockhash();

        // Confirm transaction using the last valid block height (refers to its time)
        // to check for transaction expiration
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: fromAirDropSignature
        });

        console.log("Airdrop completed for the Sender account");
        var fromWalletBalance2 = await connection.getBalance(
            new PublicKey(from._keypair.publicKey)
        );
        console.log(`Senders (from) Wallet Balance after Airdrop: ${parseInt(fromWalletBalance2) / LAMPORTS_PER_SOL} SOL`);
    } else {
        console.log("There is no need for an airdrop, Senders (from) wallet have enough balance.");
    }

    console.log(`50% of Senders (from) Balance is: ${(halfBalance / LAMPORTS_PER_SOL)} SOL`);


        console.log("halfbalance:", halfBalance);
    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: parseInt(halfBalance)
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    var fromWalletBalance3 = await connection.getBalance(
        new PublicKey(from._keypair.publicKey)
    );
    console.log(`Senders (from) Wallet balance: ${parseInt(fromWalletBalance3) / LAMPORTS_PER_SOL} SOL`);

    var toWalletBalance3 = await connection.getBalance(
        new PublicKey(to._keypair.publicKey)
    );
    console.log(`Receivers (to) Wallet balance: ${parseInt(toWalletBalance3) / LAMPORTS_PER_SOL} SOL`);
}

transferSol();

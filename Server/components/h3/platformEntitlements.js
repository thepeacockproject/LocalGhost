// Copyright (C) 2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

function GetPlatformEntitlements(req, res) {
    if (req.body.issuerId === 'ed55aa5edc5941de92fd7f64de415793') { // Hitman 3 epic namespace
        // Epic ids of hitman3 and its DLCs
        // might be incomplete
        res.json([
            '06d4d61bbb774ca99c1661bee04fbde0', // Hitman 3: Dubai
            '2e4ad3e9aa9b4dcfa709b3f3b44cbf94', // Hitman 3: Dartmoor
            'a9b1afdd05584441aeec75ba230b2e54', // Hitman 3: Berlin
            '66246e4364134f4689da72e9c6731687', // Hitman 3: Chongquing
            '4216cdf59dbc4f19af227be076520202', // Hitman 3: Mendoza
            '8a690003855745e884d5040c6bc9ede8', // Hitman 3: Carpathian Mountains
            '5d06a6c6af9b4875b3530d5328f61287', // Hitman 3 - Trinity Pack
            '0b59243cb8aa420691b66be1ecbe68c0', // HITMAN 1 Standard
            '894d1e6771044f48a8fdde934b8e443a', // HITMAN 1 GOTY Upgrade
            '391d08a543dc43a083eb50246916a291', // Hitman 3 Access Pass: HITMAN 2 Standard
            'afa4b921503f43339c360d4b53910791', // Hitman 3 Access Pass: HITMAN 2 Expansion
            'bc610b36c75442299edcbe99f6f0fb60', // Hitman 3 - Deluxe Pack
            'c141ab4a97c44cffb876695ea42fc7c5', // Episode: Sapienza
            '0e8632b4cdfb415e94291d97d727b98d', // Deadly Sins 1: Greed
            '3f9adc216dde44dda5e829f11740a0a2', // Deadly Sins 2: Pride
            'aece009ff59441c0b526f8aa69e24cfb', // Deadly Sins 3: Sloth
            'dfe5aeb89976450ba1e0e2c208b63d33', // Deadly Sins 4: Lust
            '30107bff80024d1ab291f9cd3bac9fac', // Deadly Sins 5: Gluttony
            '9e936ed2507a473db6f53ad24d2da587', // Deadly Sins 7: Wrath
            '0403062df0d347619c8dcf043c65c02e', // Deadly Sins 6: Envy
            '28455871cd0d4ffab52f557cc012ea5e', // Sarajevo Six
            'a1e9a63fa4f3425aa66b9b8fa3c9cc35', // Street Art Pack
            '08d2bc4d20754191b6c488541d2b4fa1', // Makeshift Pack
            '9220c020262f420da06eb46a4b1ce86f', // The Undying Pack
            '6cdf07da030d4f66acd50eaf3cd234c7', // The Disruptor Pack
            'f04198e0ffcf49079b5ec77bb6b66891', // The Drop Pack
            '70a9afcc8de84b6ab0f2b45b2018559b', // The Splitter pack
            '84a1a6fda4fb48afbb78ee9b2addd475', // WoA Deluxe Pack
        ]);
    } else if (
        req.body.issuerId === '1659040' // Hitman 3 steam retail appid
        || req.body.issuerId === '1847520' // Hitman 3 steam demo appid
        || req.body.issuerId === '2183750' // hitman 3 closed technical test
    ) {
        res.json([
            // Steam AppIDs of Hitman3 and its DLCs
            '1659040', // HITMAN 3
            '1847520', // Hitman 3 Demo
            '1829605', // HITMAN 3 - Dubai
            '1829604', // HITMAN 3 - Dartmoor
            '1829603', // HITMAN 3 - Berlin
            '1829602', // HITMAN 3 - Chongqing
            '1829601', // HITMAN 3 - Mendoza
            '1829600', // HITMAN 3 - Carpathian Mountains
            '1829596', // HITMAN 3 - Trinity Pack
            '1829591', // HITMAN 3 - Deluxe Pack
            '1829594', // HITMAN 3 - VR Access
            '1843460', // HITMAN 3 Access Pass: HITMAN 1 GOTY Edition
            '1829595', // HITMAN 3 Access Pass: HITMAN 1 GOTY Upgrade
            '1829593', // HITMAN 3 Access Pass: HITMAN 1 Complete First Season
            '1829592', // HITMAN 3 Access Pass: HITMAN 2 Standard
            '1829590', // HITMAN 3 Access Pass: HITMAN 2 Expansion
            '1829580', // HITMAN 3 - Seven Deadly Sins Act 1: Greed
            '1829581', // HITMAN 3 - Seven Deadly Sins Act 2: Pride
            '1829582', // HITMAN 3 - Seven Deadly Sins Act 3: Sloth
            '1829583', // HITMAN 3 - Seven Deadly Sins Act 4: Lust
            '1829584', // HITMAN 3 - Seven Deadly Sins Act 5: Gluttony
            '1829585', // HITMAN 3 - Seven Deadly Sins Act 6: Envy
            '1829586', // HITMAN 3 - Seven Deadly Sins Act 7: Wrath
        ]);
    }
}

module.exports = {
    getEntitlements: GetPlatformEntitlements,
};

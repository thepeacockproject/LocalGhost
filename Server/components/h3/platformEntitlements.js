// Copyright (C) 2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

function GetPlatformEntitlements(req, res) {
    if (req.body.issuerId == 'ed55aa5edc5941de92fd7f64de415793') { // Hitman 3 epic namespace
        // Epic ids of hitman3 and its DLCs ?
        // Probably incomplete
        res.json([
            '66246e4364134f4689da72e9c6731687', // ?
            '2e4ad3e9aa9b4dcfa709b3f3b44cbf94', // ?
            '894d1e6771044f48a8fdde934b8e443a', // ?
            'e698e1a4b63947b0bc9349a5ae2dc015', // ?
            '5d06a6c6af9b4875b3530d5328f61287', // ?
            '1dea1e39a8044a69b4020845afb4bd97', // ? (included in H3 Pre-purchase)
            'b4e2e682cecd42b3a7017ee4838b4593', // EiderGoldEditionAudience (included in H3 Deluxe Pre-purchase)
            '0b59243cb8aa420691b66be1ecbe68c0', // ?
            '8a690003855745e884d5040c6bc9ede8', // ?
            '06d4d61bbb774ca99c1661bee04fbde0', // ?
            'a9b1afdd05584441aeec75ba230b2e54', // ?
            'feeac4b521734f22ae99e8ac55a5f896', // ? (included in H3 Pre-purchase)
            '4216cdf59dbc4f19af227be076520202', // ?
            'bc610b36c75442299edcbe99f6f0fb60', // ?
        ]);
    }
}

module.exports = {
    getEntitlements: GetPlatformEntitlements,
};

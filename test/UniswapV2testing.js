const BN = require("ethers").BigNumber;
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { ecsign } = require("ethereumjs-util");

describe("UniswapTesting", () => {
  let a, b, c, d;

  beforeEach(async () => {
    [a, b, c, d] = await ethers.getSigners();

    CalHash = await ethers.getContractFactory("CalHash");
    ch = await CalHash.connect(a).deploy();
    console.log("CalHash ", await ch.getInitHash());

    UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    factory = await UniswapV2Factory.connect(a).deploy(a.address);
    console.log("Factory Address", factory.address);

    WETH9 = await ethers.getContractFactory("WETH9");
    W9 = await WETH9.connect(a).deploy();
    console.log("Weth9 Address", W9.address);
    console.log("Weth9BalanceOfA", Number(await W9.balanceOf(a.address)));

    UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");
    router = await UniswapV2Router02.connect(a).deploy(
      factory.address,
      W9.address
    );
    console.log("UniswapV2Router02 Address", router.address);

    UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
    pair = await UniswapV2Pair.connect(a).deploy();
    console.log("PairAdd", pair.address);

    FirstToken = await ethers.getContractFactory("FirstToken");
    token1 = await FirstToken.connect(a).deploy(
      BN.from("100000").mul(BN.from("10").pow("18"))
    );
    console.log("FirstToken Address", token1.address);

    SecondToken = await ethers.getContractFactory("SecondToken");
    token2 = await SecondToken.connect(a).deploy(
      BN.from("20000").mul(BN.from("10").pow("18"))
    );
    console.log("SecondToken Address", token2.address);

    FirstTaxToken = await ethers.getContractFactory("FirstTaxToken");
    taxtoken1 = await FirstTaxToken.connect(a).deploy();
    console.log("taxtoken1", Number(await taxtoken1.balanceOf(a.address)));

    SecondTaxToken = await ethers.getContractFactory("SecondTaxToken");
    taxtoken2 = await SecondTaxToken.connect(a).deploy();
    console.log("taxtoken2", Number(await taxtoken2.balanceOf(a.address)));
  });

  describe("Deployment", () => {
    it("Should test the function addLiquidity", async () => {
      await token1
        .connect(a)
        .approve(router.address, BN.from("6").mul(BN.from("10").pow("18")));

      await token2
        .connect(a)
        .approve(router.address, BN.from("2").mul(BN.from("10").pow("18")));

      await router.addLiquidity(
        token1.address,
        token2.address,
        BN.from("2").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        0,
        0,
        a.address,
        1690372889000
      );

      console.log(
        "Pair Address",
        await factory.getPair(token1.address, token2.address)
      );
      let PairAdd = await factory.getPair(token1.address, token2.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      console.log("LPToken", lpToken);
      let reserves = await pairInstance.getReserves();
      console.log("Reserve Value", reserves._reserve0);

      //   console.log("accc", await ethers.provider.getBalance(b.address));
    });

    it("Should test the function addLiquidityETH", async () => {
      await token1
        .connect(a)
        .approve(router.address, BN.from("1000").mul(BN.from("10").pow("18")));

      await router.addLiquidityETH(
        token1.address,
        BN.from("1000").mul(BN.from("10").pow("18")),
        BN.from("500").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        a.address,
        1690372889999,
        { value: 10 }
      );
      console.log("FirstToken Address", token1.address);
      let PairAdd = await factory.getPair(token1.address, W9.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      let reserves = await pairInstance.getReserves();
      console.log("Reserve0 Value", reserves._reserve0);
      console.log("Reserve1 Value", reserves._reserve1);
      console.log("LPTokenETH", lpToken);
    });
    it("Should test the function removeLiquidity", async () => {
      await token1
        .connect(a)
        .approve(router.address, BN.from("6").mul(BN.from("10").pow("18")));

      await token2
        .connect(a)
        .approve(router.address, BN.from("2").mul(BN.from("10").pow("18")));

      await router.addLiquidity(
        token1.address,
        token2.address,
        BN.from("2").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        0,
        0,
        a.address,
        1690372889000
      );

      console.log(
        "Pair Address",
        await factory.getPair(token1.address, token2.address)
      );
      let PairAdd = await factory.getPair(token1.address, token2.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      console.log("LPToken", lpToken);
      let reserves = await pairInstance.getReserves();
      console.log("Reserve Value", reserves._reserve0);

      await pairInstance.connect(a).approve(router.address, lpToken);

      await router
        .connect(a)
        .removeLiquidity(
          token1.address,
          token2.address,
          BN.from("1999999999999999000").mul(BN.from("1").pow("1")),
          BN.from("0").mul(BN.from("10").pow("18")),
          BN.from("0").mul(BN.from("10").pow("18")),
          a.address,
          1690372889000
        );
      let reserves1 = await pairInstance.getReserves();

      console.log("Reserve0 Value", reserves1._reserve0);
      console.log("Reserve1 Value", reserves1._reserve1);
    });

    it("Should test the function removeLiquidityEth", async () => {
      await token1
        .connect(a)
        .approve(router.address, BN.from("1000").mul(BN.from("10").pow("18")));

      await router.addLiquidityETH(
        token1.address,
        BN.from("1000").mul(BN.from("10").pow("18")),
        BN.from("500").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        a.address,
        1690372889999,
        { value: 10 }
      );
      console.log("FirstToken Address", token1.address);
      let PairAdd = await factory.getPair(token1.address, W9.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      let reserves2 = await pairInstance.getReserves();
      console.log("Reserve0 Value", reserves2._reserve0);
      console.log("Reserve1 Value", reserves2._reserve1);
      console.log("LPTokenETH", lpToken);

      await pairInstance.connect(a).approve(router.address, lpToken);
      await router
        .connect(a)
        .removeLiquidityETH(
          token1.address,
          BN.from("99999999000").mul(BN.from("1").pow("1")),
          BN.from("0").mul(BN.from("10").pow("18")),
          BN.from("0").mul(BN.from("10").pow("18")),
          a.address,
          169037288991000
        );

      let reserves3 = await pairInstance.getReserves();
      console.log("3Reserve0 Value", reserves3._reserve0);
      console.log("3Reserve1 Value", reserves3._reserve1);
    });

    it("Should test the function swapExactTokensForTokens", async () => {
      await token1
        .connect(a)
        .approve(router.address, BN.from("600").mul(BN.from("10").pow("18")));

      await token2
        .connect(a)
        .approve(router.address, BN.from("200").mul(BN.from("10").pow("18")));

      await router.addLiquidity(
        token1.address,
        token2.address,
        BN.from("300").mul(BN.from("10").pow("18")),
        BN.from("200").mul(BN.from("10").pow("18")),
        BN.from("0").mul(BN.from("10").pow("18")),
        BN.from("0").mul(BN.from("10").pow("18")),
        a.address,
        16903728890000
      );
      let PairAdd = await factory.getPair(token1.address, token2.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      console.log("LPToken", lpToken);
      let reserves4 = await pairInstance.getReserves();
      console.log("Reserve0 Value", reserves4._reserve0);
      console.log("Reserve1 Value", reserves4._reserve1);

      await pairInstance.connect(a).approve(router.address, 180);

      path = [token1.address, token2.address];

      await router.swapExactTokensForTokens(
        BN.from("150").mul(BN.from("10").pow("18")),
        BN.from("66").mul(BN.from("10").pow("18")),
        path,
        a.address,
        16903728899000
      );
      console.log(a.address);
      let reserves5 = await pairInstance.getReserves();
      console.log("5Reserve0 Value", reserves5._reserve0);
      console.log("5Reserve1 Value", reserves5._reserve1);
    });

    it("Should test the function swapExactETHForTokens", async () => {
      await token1
        .connect(a)
        .approve(router.address, BN.from("1000").mul(BN.from("10").pow("18")));

      await router.addLiquidityETH(
        token1.address,
        BN.from("1000").mul(BN.from("10").pow("18")),
        BN.from("500").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        a.address,
        1690372889999,
        { value: BN.from("10").mul(BN.from("10").pow("18")) }
      );
      let PairAdd = await factory.getPair(token1.address, W9.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      let reserves6 = await pairInstance.getReserves();
      console.log("7Reserve0 Value", reserves6._reserve0);
      console.log("7Reserve1 Value", reserves6._reserve1);

      await pairInstance.connect(a).approve(router.address, 6);
      console.log(token1.address);

      path = [W9.address, token1.address];

      await router.swapExactETHForTokens(
        BN.from("374").mul(BN.from("10").pow("18")),
        path,
        a.address,
        1690372899999,
        { value: BN.from("6").mul(BN.from("10").pow("18")) }
      );
      let reserves7 = await pairInstance.getReserves();
      console.log("Reserve0 Value", reserves7._reserve0);
      console.log("Reserve1 Value", reserves7._reserve1);
    });

    it("Should test the function swapTokensForExactETH", async () => {
      await token1
        .connect(a)
        .approve(router.address, BN.from("50000").mul(BN.from("10").pow("18")));

      await router.addLiquidityETH(
        token1.address,
        BN.from("10000").mul(BN.from("10").pow("18")),
        BN.from("500").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        a.address,
        1690372889999,
        { value: BN.from("20").mul(BN.from("10").pow("18")) }
      );

      let PairAdd = await factory.getPair(token1.address, W9.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      let reserves8 = await pairInstance.getReserves();
      console.log("8Reserve0 Value", reserves8._reserve0);
      console.log("8Reserve1 Value", reserves8._reserve1);

      path2 = [token1.address, W9.address];

      await router.swapTokensForExactETH(
        BN.from("10").mul(BN.from("10").pow("18")),
        BN.from("11000").mul(BN.from("10").pow("18")),
        path2,
        a.address,
        1690372899999
      );

      let reserves9 = await pairInstance.getReserves();
      console.log("9Reserve0 Value", reserves9._reserve0);
      console.log("9Reserve1 Value", reserves9._reserve1);
    });

    it("Should test the function swapExactTokensForETH", async () => {
      await token1
        .connect(a)
        .approve(router.address, BN.from("50000").mul(BN.from("10").pow("18")));

      await router.addLiquidityETH(
        token1.address,
        BN.from("12000").mul(BN.from("10").pow("18")),
        BN.from("500").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        a.address,
        1690372889999,
        { value: BN.from("20").mul(BN.from("10").pow("18")) }
      );

      let PairAdd = await factory.getPair(token1.address, W9.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      let reserves8 = await pairInstance.getReserves();
      console.log("8Reserve0 Value", reserves8._reserve0);
      console.log("8Reserve1 Value", reserves8._reserve1);

      path3 = [token1.address, W9.address];
      let AmountOut = await router.getAmountsOut(
        BN.from("36000").mul(BN.from("10").pow("18")),
        path3
      );
      console.log("Amount", AmountOut);
      await router.swapExactTokensForETH(
        BN.from("36000").mul(BN.from("10").pow("18")),
        BN.from("5").mul(BN.from("10").pow("18")),
        path3,
        a.address,
        1690372899999
      );
      let reserves10 = await pairInstance.getReserves();
      console.log("10Reserve0 Value", reserves10._reserve0);
      console.log("10Reserve1 Value", reserves10._reserve1);
    });

    it("Should test the function swapETHForExactTokens", async () => {
      await token1
        .connect(a)
        .approve(router.address, BN.from("50000").mul(BN.from("10").pow("18")));

      await router.addLiquidityETH(
        token1.address,
        BN.from("5000").mul(BN.from("10").pow("18")),
        BN.from("500").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        a.address,
        1690372889999,
        { value: BN.from("20").mul(BN.from("10").pow("18")) }
      );
      let PairAdd = await factory.getPair(token1.address, W9.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      path4 = [W9.address, token1.address];

      await router.swapETHForExactTokens(
        BN.from("3000").mul(BN.from("10").pow("18")),
        path4,
        a.address,
        1690372899999,
        { value: BN.from("32").mul(BN.from("10").pow("18")) }
      );
      let reserves11 = await pairInstance.getReserves();
      console.log("11Reserve0 Value", reserves11._reserve0);
      console.log("11Reserve1 Value", reserves11._reserve1);
    });

    it("Should test the function swapExactTokensForTokensSupportingFeeOnTransferTokens", async () => {
      await taxtoken1
        .connect(a)
        .approve(router.address, BN.from("500").mul(BN.from("10").pow("18")));

      await taxtoken2
        .connect(a)
        .approve(router.address, BN.from("500").mul(BN.from("10").pow("18")));
      let bal1 = await taxtoken1.allowance(a.address, router.address);
      console.log("Bal1", bal1);

      let bal2 = await taxtoken2.allowance(a.address, router.address);
      console.log("Bal2", bal2);

      console.log("taxtoken1111", await taxtoken1.balanceOf(a.address));
      console.log("taxtoken2222", await taxtoken2.balanceOf(a.address));

      await router.addLiquidity(
        taxtoken1.address,
        taxtoken2.address,
        BN.from("100").mul(BN.from("10").pow("18")),
        BN.from("200").mul(BN.from("10").pow("18")),
        50,
        100,
        a.address,
        1690372889000
      );
      console.log("taxtoken222", Number(await taxtoken2.balanceOf(a.address)));

      console.log(
        "Pair Address",
        await factory.getPair(taxtoken1.address, taxtoken2.address)
      );
      let PairAdd = await factory.getPair(taxtoken1.address, taxtoken2.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      console.log("LPToken", lpToken);
      let reserves10 = await pairInstance.getReserves();
      console.log("10Reserve Value0", reserves10._reserve0);
      console.log("10Reserve Value1", reserves10._reserve1);

      path5 = [taxtoken1.address, taxtoken2.address];

      await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        BN.from("80").mul(BN.from("10").pow("18")),
        BN.from("20").mul(BN.from("10").pow("18")),
        path5,
        a.address,
        1690372899000
      );
      let reserves11 = await pairInstance.getReserves();
      console.log("11Reserve Value0", reserves11._reserve0);
      console.log("11Reserve Value1", reserves11._reserve1);
    });

    it("Should test the function swapExactETHForTokensSupportingFeeOnTransferTokens", async () => {
      await taxtoken1
        .connect(a)
        .approve(router.address, BN.from("50000").mul(BN.from("10").pow("18")));

      await router.addLiquidityETH(
        taxtoken1.address,
        BN.from("10000").mul(BN.from("10").pow("18")),
        BN.from("300").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        a.address,
        1690372889999,
        { value: BN.from("20").mul(BN.from("10").pow("18")) }
      );
      let PairAdd = await factory.getPair(taxtoken1.address, W9.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      let reserves12 = await pairInstance.getReserves();
      console.log("12Reserve0 Value0", reserves12._reserve0);
      console.log("12Reserve1 Value1", reserves12._reserve1);

      await pairInstance.connect(a).approve(router.address, 7);
      path6 = [W9.address, taxtoken1.address];

      await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
        BN.from("600").mul(BN.from("10").pow("18")),
        path6,
        a.address,
        1690372899999,
        { value: BN.from("7").mul(BN.from("10").pow("18")) }
      );
      let reserves13 = await pairInstance.getReserves();
      console.log("13Reserve0 Value0", reserves13._reserve0);
      console.log("13Reserve1 Value1", reserves13._reserve1);
    });

    it("Should test the function swapExactTokensForETHSupportingFeeOnTransferTokens", async () => {
      await taxtoken1
        .connect(a)
        .approve(router.address, BN.from("50000").mul(BN.from("10").pow("18")));

      await router.addLiquidityETH(
        taxtoken1.address,
        BN.from("12000").mul(BN.from("10").pow("18")),
        BN.from("500").mul(BN.from("10").pow("18")),
        BN.from("2").mul(BN.from("10").pow("18")),
        a.address,
        1690372889999,
        { value: BN.from("20").mul(BN.from("10").pow("18")) }
      );

      let PairAdd = await factory.getPair(taxtoken1.address, W9.address);
      let pairInstance = await UniswapV2Pair.attach(PairAdd);
      let lpToken = await pairInstance.balanceOf(a.address);
      let reserves14 = await pairInstance.getReserves();
      console.log("14Reserve0 Value0", reserves14._reserve0);
      console.log("14Reserve1 Value1", reserves14._reserve1);

      path7 = [taxtoken1.address, W9.address];

      await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
        BN.from("36000").mul(BN.from("10").pow("18")),
        BN.from("5").mul(BN.from("10").pow("18")),
        path7,
        a.address,
        1690372899999
      );
      let reserves15 = await pairInstance.getReserves();
      console.log("15Reserve0 Value", reserves15._reserve0);
      console.log("15Reserve1 Value", reserves15._reserve1);
    });

  //   it("Should check the function removeLiquidityWithPermit", async () => {
  //     const deadLine = ethers.constants.MaxUint256;
  //     console.log(deadLine);
  //     await token1
  //       .connect(a)
  //       .approve(router.address, BN.from("600").mul(BN.from("10").pow("18")));

  //     await token2
  //       .connect(a)
  //       .approve(router.address, BN.from("800").mul(BN.from("10").pow("18")));
  //     console.log("i m in 2");

  //     await router.addLiquidity(
  //       token1.address,
  //       token2.address,
  //       BN.from("500").mul(BN.from("10").pow("18")),
  //       BN.from("600").mul(BN.from("10").pow("18")),
  //       0,
  //       0,
  //       a.address,
  //       deadLine
  //     );

  //     console.log(
  //       "Pair Address",
  //       await factory.getPair(token1.address, token2.address)
  //     );
  //     let PairAdd = await factory.getPair(token1.address, token2.address);
  //     let pairInstance = await UniswapV2Pair.attach(PairAdd);
  //     let lpToken = await pairInstance.balanceOf(a.address);
  //     console.log("LPToken", lpToken);
  //     let reserves16 = await pairInstance.getReserves();
  //     console.log("16Reserve Value0", reserves16._reserve0);
  //     console.log("16Reserve Value1", reserves16._reserve1);

  //     let signature1 = await a._signTypedData(
  //       {
  //         name: await pairInstance.name(),
  //         version: "1",
  //         chainId: 0,
  //         verifyingContract: pairInstance.address,
  //       },

  //       {
  //         Permit: [
  //           {
  //             name: "owner",
  //             type: "address",
  //           },
  //           {
  //             name: "spender",
  //             type: "address",
  //           },
  //           {
  //             name: "value",
  //             type: "uint256",
  //           },
  //           {
  //             name: "nonce",
  //             type: "uint256",
  //           },
  //           {
  //             name: "deadline",
  //             type: "uint256",
  //           },
  //         ],
  //       },

  //       {
  //         owner: a.address,
  //         spender: router.address,
  //         value: lpToken,
  //         nonce: await pairInstance.nonces(a.address),
  //         deadline: deadLine,
  //       }
  //     );

  //     console.log("Signature",signature1);

  //     const sig1 = await ethers.utils.splitSignature(signature1);
  //     console.log("VRS",sig1);
  //     console.log(sig1.v);



  //     await router.removeLiquidityWithPermit(
  //       token1.address,
  //       token2.address,
  //       lpToken,
  //       BN.from("20").mul(BN.from("10").pow("18")),
  //       BN.from("20").mul(BN.from("10").pow("18")),
  //       a.address,
  //       deadLine,
  //       false,
  //       sig1.v,
  //       sig1.r,
  //       sig1.s
  //     );

  //     let reserves17 = await pairInstance.getReserves();
  //     console.log("17Reserve Value0", reserves17._reserve0);
  //     console.log("17Reserve Value1", reserves17._reserve1);
  //   });

  // it("Should Test the Function removeLiquidityETHWithPermit", async()=>{

  //   const deadLine = ethers.constants.MaxUint256;

  //   await token1
  //       .connect(a)
  //       .approve(router.address, BN.from("1000").mul(BN.from("10").pow("18")));

  //     await router.addLiquidityETH(
  //       token1.address,
  //       BN.from("1000").mul(BN.from("10").pow("18")),
  //       BN.from("500").mul(BN.from("10").pow("18")),
  //       BN.from("2").mul(BN.from("10").pow("18")),
  //       a.address,
  //       deadLine,
  //       { value: 10 }
  //     );
  //     console.log("FirstToken Address", token1.address);
  //     let PairAdd = await factory.getPair(token1.address, W9.address);
  //     let pairInstance = await UniswapV2Pair.attach(PairAdd);
  //     let lpToken = await pairInstance.balanceOf(a.address);
  //     let reserves18 = await pairInstance.getReserves();
  //     console.log("18Reserve Value0", reserves18._reserve0);
  //     console.log("18Reserve Value1", reserves18._reserve1);


  //     let signature1 = await a._signTypedData(
  //       {
  //         name: await pairInstance.name(),
  //         version: "1",
  //         chainId: 0,
  //         verifyingContract: pairInstance.address,
  //       },

  //       {
  //         Permit: [
  //           {
  //             name: "owner",
  //             type: "address",
  //           },
  //           {
  //             name: "spender",
  //             type: "address",
  //           },
  //           {
  //             name: "value",
  //             type: "uint256",
  //           },
  //           {
  //             name: "nonce",
  //             type: "uint256",
  //           },
  //           {
  //             name: "deadline",
  //             type: "uint256",
  //           },
  //         ],
  //       },

  //       {
  //         owner: a.address,
  //         spender: router.address,
  //         value: lpToken,
  //         nonce: await pairInstance.nonces(a.address),
  //         deadline: deadLine,
  //       }
  //     );
  //     const sig1 = await ethers.utils.splitSignature(signature1);
  //     console.log("VRS",sig1);
      

  //     await router.removeLiquidityETHWithPermit(
  //       token1.address,
  //       lpToken,
  //       BN.from("0").mul(BN.from("10").pow("18")),
  //       BN.from("0").mul(BN.from("10").pow("18")),
  //       a.address,
  //       deadLine,
  //       false,
  //       sig1.v,
  //       sig1.r,
  //       sig1.s
  //       );

  //     let reserves19 = await pairInstance.getReserves();
  //     console.log("19Reserve Value0", reserves19._reserve0);
  //     console.log("19Reserve Value1", reserves19._reserve1);
  // })

//------------------------------------------------------------//
  // it("Should Test the function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens", async()=>{

    
  //    const deadLine = ethers.constants.MaxUint256;
  //    console.log("i m  in");
  //    await taxtoken1
  //       .connect(a)
  //       .approve(router.address, BN.from("1000").mul(BN.from("10").pow("18")));
  //       console.log("i m  in 23");

  //     await router.addLiquidityETH(
  //       taxtoken1.address,
  //       BN.from("800").mul(BN.from("10").pow("18")),
  //       BN.from("500").mul(BN.from("10").pow("18")),
  //       BN.from("2").mul(BN.from("10").pow("18")),
  //       a.address,
  //       deadLine,
  //       { value: 10 }
  //     );
  //     console.log("i m  in 2");

  //     let PairAdd = await factory.getPair(taxtoken1.address, W9.address);
  //     let pairInstance = await UniswapV2Pair.attach(PairAdd);
  //     console.log("i m  in 3");

  //     let lpToken = await pairInstance.balanceOf(a.address);
  //     let reserves20 = await pairInstance.getReserves();
  //     console.log("20Reserve0 Value", reserves20._reserve0);
  //     console.log("20Reserve1 Value", reserves20._reserve1);
  //     console.log("LPTokenETH", lpToken);
  //     console.log(" pairInstance.nonces",await pairInstance.nonces(a.address));
  //     let signature1 = await a._signTypedData(
  //       {
  //         name: await pairInstance.name(),
  //         version: "1",
  //         chainId: 0,
  //         verifyingContract: pairInstance.address,
  //       },

  //       {
  //         Permit: [
  //           {
  //             name: "owner",
  //             type: "address",
  //           },
  //           {
  //             name: "spender",
  //             type: "address",
  //           },
  //           {
  //             name: "value",
  //             type: "uint256",
  //           },
  //           {
  //             name: "nonce",
  //             type: "uint256",
  //           },
  //           {
  //             name: "deadline",
  //             type: "uint256",
  //           },
  //         ],
  //       },

  //       {
  //         owner: a.address,
  //         spender: router.address,
  //         value: lpToken,
  //         nonce: await pairInstance.nonces(a.address),
  //         deadline: deadLine,
  //       }
  //     );
      
  //     console.log("signature1",signature1);

  //     const sig1 = await ethers.utils.splitSignature(signature1);
  //     console.log("VRS",sig1);

  //     await router.removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
  //       taxtoken1.address,
  //       lpToken,
  //       BN.from("0").mul(BN.from("10").pow("18")),
  //       BN.from("0").mul(BN.from("10").pow("18")),
  //       a.address,
  //       deadLine,
  //       false,
  //       sig1.v,
  //       sig1.r,
  //       sig1.s
  //     );

  //     let reserves21 = await pairInstance.getReserves();
  //     console.log("21Reserve0 Value", reserves21._reserve0);
  //     console.log("21Reserve1 Value", reserves21._reserve1);
  // })
  });
});

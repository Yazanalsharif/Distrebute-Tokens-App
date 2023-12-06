//test account: 0x67D75c5AE4608024f8B0Faaa7ad8290DC0f78F51
//from account: 0x0a0b13049081B3Bc0f0e69E4Cf829456a7e01AaC
const Web3 = require("web3");
const fs = require("fs");
const readExcelFile = require("read-excel-file/node");
const contractApi = require("./contractsApi");
const xl = require("excel4node");

/*
to use this script you should filtering the addresses using writeExcelFiles and this function will take the list of addresses from the file and create two files
file for the valid addresses and file for unValid addresses and it depends on the address if he has an BNB coin of he made some transaction so the addresses did't create by the bot.

the secound function is sendTransaction and this function responsible for sending transaction using the 

*/
const getListOfAddress = async (path) => {
  return new Promise((resolve, reject) => {
    readExcelFile(path)
      .then((row) => {
        return resolve(row);
      })
      .catch((error) => {
        return reject({ err: "the error happened", error });
      });
  });
};

//check the address and return the address if its a valid or not valid
const checkAddress = async (address) => {
  try {
    //trim the address (delete spaces between)
    address = address.trim();
    //connect with bsc main network
    const web3 = await new Web3("https://bsc-dataseed1.binance.org:443");
    const BN = web3.utils.BN;
    //check if the address has some BNB coin on the account
    let balanceWei = await web3.eth.getBalance(address);
    //convert the balance to BN Wei
    const balanceBN = new BN(balanceWei);

    //the balance with ether util
    let balance = await web3.utils.fromWei(balanceBN);

    //if the balance = 0 we will go to another condition
    if (balance > 0) {
      console.log("valid address because he has some bnb");
      return address;
    }

    //return the nonce of the account
    const numOfTransaction = await web3.eth.getTransactionCount(address);

    if (numOfTransaction > 0) {
      console.log(
        "the address is valid because he has been send transaction before"
      );
      return address;
    }

    return undefined;
  } catch (error) {
    console.log(error.message);
    return undefined;
  }
};

//this function to check the addresses like which one is valide and which one is scam and add it to the excels files
const writeExcelFiles = async () => {
  // Create a new instance of a Workbook class
  var validFile = new xl.Workbook();
  var unValidFile = new xl.Workbook();
  // Add Worksheets to the workbook
  var validWorkSheet = validFile.addWorksheet("Sheet 1");
  var unvalidWoorkSheet = unValidFile.addWorksheet("Sheet 1");

  // Create a reusable style
  var style = validFile.createStyle({
    font: {
      color: "#000000",
      size: 12,
    },
    numberFormat: "$#,##0.00; ($#,##0.00); -",
  });
  //get the addresses from another file in excel
  const addressesBeforeCheck = await getListOfAddress();
  //variable for handeling the loop
  let address;
  //valid row to add to new row everytime
  let validRow = 1,
    unValidRow = 1;
  for (let i = 0; i < addressesBeforeCheck.length; i++) {
    address = await checkAddress(addressesBeforeCheck[i][0]);

    if (!address) {
      unvalidWoorkSheet
        .cell(unValidRow, 1)
        .string(addressesBeforeCheck[i][0].toString())
        .style(style);
      unValidRow++;
    } else {
      validWorkSheet.cell(validRow, 1).string(address.toString()).style(style);
      validRow++;
    }
  }
  validFile.write("validAddresses.xlsx");
  unValidFile.write("unValidAddresses.xlsx");
};

//writeExcelFiles();

const sendTransactions = async () => {
  try {
    const pk =
      "194e8aa8b3b9c6c1dc439730c6f5e4c859a969eb2d7375063baabeb967317024";
    const fromAddress = "0x1C94258505b544D0194C236c0B3F9806f65e8b7B";
    const contractAddress = "0xb139ed26b743c7254a246cf91eb594d097238524";
    const web3 = new Web3("https://bsc-dataseed1.binance.org:443");

    web3.eth.accounts.wallet.add(pk);

    const falconContract = new web3.eth.Contract(contractApi, contractAddress, {
      from: fromAddress,
    });

    const amount = web3.utils.toBN(110 * 1e18);

    const listAddresses = await getListOfAddress(
      "list of the bsc addresses.xlsx"
    );
    console.log(listAddresses);
    /* let accountNonce =
      '0x' + (web3.eth.getTransactionCount(fromAddress) + 1).toString(16);*/
    //const transactionCount = await web3.eth.getTransactionCount(fromAddress);
    let transactionCountIncludingPending = await web3.eth.getTransactionCount(
      fromAddress,
      "pending"
    );

    let counter = 1,
      isAddress;
    for (let i = 0; i < listAddresses.length; i++) {
      isAddress = web3.utils.isAddress(listAddresses[i][0]);
      if (isAddress) {
        await falconContract.methods
          .transfer(listAddresses[i][0], amount)
          .send({
            from: fromAddress,
            gas: 79569,
            gasPrice: 5000000000,
            nonce: transactionCountIncludingPending,
          });
        //get the nonce of the address with pending transaction
        transactionCountIncludingPending++;

        console.log(counter + " ", listAddresses[i][0]);
        counter++;
      } else {
        console.log("not address");
      }
    }
    console.log("the number of tx ", counter);
  } catch (error) {
    console.log(error.message);
  }
};

sendTransactions();

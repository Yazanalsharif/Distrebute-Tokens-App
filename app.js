//test account: 0x67D75c5AE4608024f8B0Faaa7ad8290DC0f78F51
//from account: 0x0a0b13049081B3Bc0f0e69E4Cf829456a7e01AaC
const Web3 = require('web3');
const fs = require('fs');
const readExcelFile = require('read-excel-file/node');

const contractApi = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
];

const getListOfAddress = async () => {
  return new Promise((resolve, reject) => {
    readExcelFile('./Addresses-list.xlsx')
      .then((row) => {
        return resolve(row);
      })
      .catch((error) => {
        return reject({ err: 'the error happened', error });
      });
  });
};

const sendTransactions = async () => {
  try {
    const pk =
      '99e81d63ec6facce30801db0467e300211712fa0c44a5cc579a3f4fdbcd0578f';
    const toAddress = '0xac0e15a038eedfc68ba3c35c73fed5be4a07afb5';
    const fromAddress = '0x0a0b13049081B3Bc0f0e69E4Cf829456a7e01AaC';
    const contractAddress = '0xb139ed26b743c7254a246cf91eb594d097238524';
    const web3 = new Web3('https://bsc-dataseed1.binance.org:443');

    web3.eth.accounts.wallet.add(pk);
    const accounts = web3.eth.accounts;

    const falconContract = new web3.eth.Contract(contractApi, contractAddress, {
      from: fromAddress,
    });

    const balance = await falconContract.methods.balanceOf(fromAddress).call();
    //console.log(balance / 10e18);
    const amount = web3.utils.toBN(1e18);

    /**/
    const listAddresses = await getListOfAddress();
    /* let accountNonce =
      '0x' + (web3.eth.getTransactionCount(fromAddress) + 1).toString(16);*/
    //const transactionCount = await web3.eth.getTransactionCount(fromAddress);
    let transactionCountIncludingPending = await web3.eth.getTransactionCount(
      fromAddress,
      'pending'
    );

    console.log(transactionCountIncludingPending);
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
        transactionCountIncludingPending = await web3.eth.getTransactionCount(
          fromAddress,
          'pending'
        );
        console.log(counter);
        counter++;
      } else {
        console.log('not address');
      }
    }
    console.log('the number of tx ', counter);
  } catch (error) {
    console.log(error.message);
  }
};

sendTransactions();

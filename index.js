// modulos externos
const chalk = require("chalk");

const inquirer = require("inquirer");

// modulos internos
const fs = require("fs");
const { log } = require("console");

operation(); //invoca as opções de listas

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Transferir",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];

      if (action === "Criar Conta") {
        createAccout();
      }
      if (action === "Depositar") {
        deposit();
      }
      if (action === "Consultar Saldo") {
        getAccountBalance();
      }
      if (action === "Transferir") {
        transfer();
      }
      if (action === "Sacar") {
        withdraw();
      }
      if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o nosso banco!"));
        process.exit();
      }
    })
    .catch((err) => console.log(err, "Algo deu errado!"));
}

// create an account
function createAccout() {
  console.log(chalk.bgGreen.black("Obrigado por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));

  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      console.info(accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Essa conta já existe, escolha outro nome!")
        );
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        function (err) {
          console.log(err);
        }
      ); // aqui estou determinando que vou dar um conteudo a ele

      log(chalk.green("Conta criada com sucesso!"));
      operation();
    })
    .catch((err) => console.log(err, "Algo deu errado!"));
}

// depositar valores a uma conta
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      // verificar se a conta existe
      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Qual o valor do depósito?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          // adicionar o valor do usuario
          addAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err, "Algo deu errado!"));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black("Essa conta não existe, escolha outro nome!")
    );
    return false;
  }
  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed.black("Valor inválido!"));
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );
  console.log(chalk.green(`Depósito de ${amount} realizado com sucesso!`));
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });
  return JSON.parse(accountJSON);
}

// mostrar o saldo da conta

function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      // verificando se a conta existe
      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `O saldo da conta ${accountName} é de R$ ${accountData.balance}`
        )
      );

      operation();
    })
    .catch((err) => console.log(err, "Algo deu errado!"));
}

//  sacar valores de uma conta
function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Qual o valor do saque?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          removeAmount(accountName, amount);
        })
        .catch((err) => console.log(err, "Algo deu errado!"));
    })
    .catch((err) => console.log(err, "Algo deu errado!"));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed.black("Valor inválido!"));
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Saldo insuficiente!"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(chalk.green(`Saque de ${amount} realizado com sucesso!`));
  operation();
}


// aqui vamos fazer para realizar a transferencia de saldo para contas

function transfer() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?',
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];

        if (!checkAccount(accountName)) {
            return transfer();
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Qual o valor da transferência?',
            },
            {
                name: 'destinationAccount',
                message: 'Qual o nome da conta de destino?',
            }
        ]).then((answer) => {
            const amount = answer['amount'];
            const destinationAccount = answer['destinationAccount'];

            if (!checkAccount(destinationAccount)) {
                console.log(chalk.bgRed.black('Conta de destino não encontrada!'));
                return transfer();
            }

            transferAmount(accountName, destinationAccount, amount);
            console.log(chalk.green(`Transferência de ${amount} realizada com sucesso!`));
            operation();
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

function transferAmount(accountName, destinationAccount, amount) {
    const accountData = getAccount(accountName);
    const destinationAccountData = getAccount(destinationAccount);

    if (!amount) {
        console.log(chalk.bgRed.black('Valor inválido!'));
        return transfer();
    }

    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Saldo insuficiente!'));
        return transfer();
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
    destinationAccountData.balance = parseFloat(destinationAccountData.balance) + parseFloat(amount);

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function (err) {
        if (err) {
            console.log(err);
        }
    });

    fs.writeFileSync(`accounts/${destinationAccount}.json`, JSON.stringify(destinationAccountData), function (err) {
        if (err) {
            console.log(err);
        }
    });
}
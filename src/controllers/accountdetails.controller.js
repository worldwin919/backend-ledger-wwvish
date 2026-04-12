const accountModel = require("../models/account.models");

async function getAccountDetailsController(req, res, next) {
  const { id } = req.params;
  const user = req.user; //assuming already auth as auth middleware

  try {
    const account = await accountModel.findOne({
      _id: id,
      user: user._id,
    });

    if (!account) {
      //doesnt exist in db
      return res.status(404).json({
        message: "Account not found",
      });
    }

    //els found , get all other details
    //other details ar alrady in account object
    //just need balance from ledger, single sourc sof truth

    const balance = await account.getBalance();

    //return the details

    return res.status(200).json({
      account: {
        _id: account._id,
        user: account.user,
        status: account.status,
        currency: account.currency,
        balance: balance,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    //global error handler will catch this
    next(error);
  }
}

module.exports = {
  getAccountDetailsController,
};

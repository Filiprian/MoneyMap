const express = require("express")
const {connectDb, getDb} = require("./db")
const { ObjectId } = require("mongodb")
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express()

app.use(express.json()) // Passing req body

// Safety and security
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' })); // or your frontend URL
// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
}));

// Basic input sanitization (blocks $ and . in top-level keys)
const sanitize = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  }
  return obj;
};
app.use((req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  next();
});

// Database connection
let db
connectDb(function(err) {
    if (!err) {
        app.listen(3000, function() {
            console.log("Running on port 3000");
        })
        db = getDb()
    } else {
        console.log("Error in connecting db")
    }
})

// GET all transactions
app.get("/transactions", (req, res) => {
    const transactions = []

    db.collection("transactions")
        .find()
        .forEach(transaction => transactions.push(transaction))
        .then(() => {
            res.status(200).json(transactions)
        })
        .catch(() => {
            res.status(500).json({error: "Error in GET"})
        })
})

// GET one transaction by id
app.get("/transactions/:id", (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
        db.collection("transactions")
            .findOne({_id: new ObjectId(req.params.id)})
            .then(transaction => {
                res.status(200).json(transaction)
            })
            .catch(() => {
                res.status(500).json({error: "Error in GET one doc"})
            })
    } else {
        res.status(404).json({error: "Invalid ID"})
    }
})

// ADD transaction
app.post("/transactions", (req, res) => {
    const newTransaction = req.body

    db.collection("transactions")
        .insertOne(newTransaction)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(() => {
            res.status(500).json({error: "Error in POST"})
        })
})

// DELETE transaction
app.delete("/transactions/:id", (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
        db.collection("transactions")
            .deleteOne({_id: new ObjectId(req.params.id)})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(() => {
                res.status(500).json({error: "Error in DELETE"})
            })
    } else {
        res.status(404).json({error: "Invalid ID"})
    }
})

// UPDATE transaction
app.put("/transactions/:id", (req, res) => {
    const updatedTransaction = req.body

    if (ObjectId.isValid(req.params.id)) {
        db.collection("transactions")
            .updateOne({_id: new ObjectId(req.params.id)}, {$set: updatedTransaction})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(() => {
                res.status(500).json({error: "Error in UPDATE"})
            })
    } else {
        res.status(404).json({error: "Invalid ID"})
    }
})

// GET all budgets
app.get("/budgets", (req, res) => {
    const budgets = []

    db.collection("budgets")
        .find()
        .forEach(budget => budgets.push(budget))
        .then(() => {
            res.status(200).json(budgets)
        })
        .catch(() => {
            res.status(500).json({error: "Error in GET"})
        })
})

// GET one budget by id
app.get("/budgets/:id", (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
        db.collection("budgets")
            .findOne({_id: new ObjectId(req.params.id)})
            .then(budget => {
                res.status(200).json(budget)
            })
            .catch(() => {
                res.status(500).json({error: "Error in GET one doc"})
            })
    } else {
        res.status(404).json({error: "Invalid ID"})
    }
})

// ADD budget
app.post("/budgets", (req, res) => {
    const newBudget = req.body

    db.collection("budgets")
        .insertOne(newBudget)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(() => {
            res.status(500).json({error: "Error in POST"})
        })
})

// DELETE budget
app.delete("/budgets/:id", (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
        db.collection("budgets")
            .deleteOne({_id: new ObjectId(req.params.id)})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(() => {
                res.status(500).json({error: "Error in DELETE"})
            })
    } else {
        res.status(404).json({error: "Invalid ID"})
    }
})

// UPDATE budget
app.put("/budgets/:id", (req, res) => {
    const updatedBudget = req.body

    if (ObjectId.isValid(req.params.id)) {
        db.collection("budgets")
            .updateOne({_id: new ObjectId(req.params.id)}, {$set: updatedBudget})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(() => {
                res.status(500).json({error: "Error in UPDATE"})
            })
    } else {
        res.status(404).json({error: "Invalid ID"})
    }
})
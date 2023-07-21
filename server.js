const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const port = 3000;
app.use(express.static(path.join(__dirname)));

app.use(express.json());

app.get("/", (req, res) => {
  fs.readFile("employees_list.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to read data." });
    }

    const jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

app.post("/", (req, res) => {
  const newData = req.body;

  fs.readFile("employees_list.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to read data." });
    }

    const jsonData = JSON.parse(data);
    jsonData.push(newData);

    fs.writeFile(
      "employees_list.json",
      JSON.stringify(jsonData, null, 2),
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to write data." });
        }

        res.json({ message: "Data added successfully!" });
      }
    );
  });
});

// Deleting all data from array

app.post("/clear-all", (req, res) => {
  // Simply overwrite the JSON file with an empty array
  fs.writeFile("employees_list.json", "[]", (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to clear data." });
    }

    res.json({ message: "All data cleared successfully!" });
  });
});

app.post("/delete-one", (req, res) => {
  const newData = req.body;

  fs.writeFile(
    "employees_list.json",
    JSON.stringify(newData, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to write data." });
      }

      res.json({ message: "Data deleted successfully!" });
    }
  );
});
//Binding the server to a port(3000)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

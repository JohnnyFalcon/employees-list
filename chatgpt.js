$(document).ready(function () {
  // Capture the form submission event
  $("form").submit(function (e) {
    e.preventDefault(); // Prevent the form from submitting

    // Retrieve the form input values
    var name = $("#name").val();
    var email = $("#email").val();

    // Load the existing JSON data from the local file
    $.getJSON("data.json", function (data) {
      // Find the last object in the data array
      var lastObject = data[data.length - 1];

      // Get the ID of the last object and increment it by 1
      var id = lastObject.id + 1;

      // Create a new object with the incremented ID and input values
      var newObject = {
        id: id,
        name: name,
        email: email
      };

      // Append the new object to the loaded JSON data
      data.push(newObject);

      // Save the updated JSON data back to the local file
      $.ajax({
        type: "POST",
        url: "save.php", // or any server-side script to handle saving
        data: { jsonData: JSON.stringify(data) },
        success: function () {
          alert("Data saved successfully!");
        },
        error: function () {
          alert("Error occurred while saving data.");
        }
      });
    });
  });
});

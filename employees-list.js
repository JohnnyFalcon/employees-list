$(document).ready(function () {
  $(".employee-form").validate({
    highlight: function (element) {
      $(element).addClass("invalid-input");
    },
    unhighlight: function (element) {
      $(element).removeClass("invalid-input");
    },
    submitHandler: function (form) {
      var name = $("#name").val();
      var surname = $("#surname").val();
      var occupation = $("#occupation").val();
      var location = $("#location").val();
      var startDate = $("#start-date").val();
      var earnings = $("#earnings").val();

      $(".submit-btn").css("display", "none");
      $(".spinner-submit").css("display", "inline-block");

      $.getJSON("employees_list.json", function (data) {
        // Find the last object in the data array

        if (data.length === 0) {
          var id = 0;
        } else {
          var lastObject = data[data.length - 1];

          var id = lastObject.id + 1;
          console.log(data);
        }

        var newObject = {
          id: id,
          name: name,
          surname: surname,
          occupation: occupation,
          location: location,
          start_date: startDate,
          earnings: earnings
        };

        console.log(newObject);
        $.ajax({
          type: "POST",
          url: "https://cheery-madeleine-8e2491.netlify.app",
          data: JSON.stringify(newObject),
          contentType: "application/json",
          success: function (response) {
            console.log("Data added successfully!");

            setTimeout(() => {
              $(".spinner-submit").css("display", "none");
              $(".submit-msg").css("display", "block");
            }, 2000);

            setTimeout(() => {
              $(".submit-msg").css("display", "none");
              $(".submit-btn").css("display", "block");
              form.submit();
              closeForm();
            }, 3000);
          },
          error: function (error) {
            console.error("Error submitting form:", error);
            console.log("Error submitting form.");
          }
        });
      });
    }
  });

  $(".delete").on("click", function () {
    $.ajax({
      type: "POST",
      url: "https://cheery-madeleine-8e2491.netlify.app/clear-all",
      success: function (response) {
        console.log(response.message);
        location.reload();
      },
      error: function (error) {
        console.error("Error deleting data:", error);
      }
    });
  });

  function removeObjectWithId(arr, id) {
    const newArr = arr.filter((item) => item.id !== id);
    console.log(newArr);
    return newArr;
  }

  function deleteObjectById(id) {
    $(".delete-one").on("click", function () {
      if (id === undefined) {
        return "";
      } else {
        $(".delete-one").css("display", "none");
        $(".div-spinner").css("display", "block");

        $.getJSON("employees_list.json", function (data) {
          var newData = removeObjectWithId(data, id);
          $.ajax({
            type: "POST",
            url: `https://cheery-madeleine-8e2491.netlify.app/delete-one`,
            data: JSON.stringify(newData),
            contentType: "application/json",
            success: function (response) {
              setTimeout(() => {
                $(".delete-one").css("display", "inline-block");
                $(".div-spinner").css("display", "none");
                location.reload();
              }, 2000);
              console.log(response.message);
            },
            error: function (error) {
              console.error("Error deleting object:", error);
            }
          });
        });
      }
    });
  }

  $.extend($.validator.messages, {
    required: "To pole jest wymagane."
  });

  $(".btn-add").on("click", function () {
    $(".employee-form").css("display", "flex");
    $(".overlay").css("display", "block");
  });

  let closeForm = () => {
    $(".employee-form").css("display", "none");
    $(".overlay").css("display", "none");
    $(".employee-form").trigger("reset");

    $(".employee-form").validate().resetForm();
    $(".employee-form").find(".invalid-input").removeClass("invalid-input");
  };

  $(".close").on("click", function () {
    closeForm();
  });

  //       --- DataTables configuration ---

  let minInput = $(
    '<label  class="label-input">Data od: <input  type="date" id="min-value" class="input-date" ></label>'
  );
  let maxInput = $(
    '<label  class="label-input">do: <input type="date" id="max-value" class="input-date" ></label>'
  );

  $.ajax({
    url: "employees_list.json",
    dataType: "json",
    success: function (data) {
      $("#myTable").DataTable({
        data: data,
        columns: [
          { data: "id", visible: false, searchable: false },
          { data: "name" },
          { data: "surname" },
          { data: "occupation" },
          { data: "location" },
          { data: "start_date" },
          { data: "earnings" }
        ],
        order: [[2, "asc"]],
        dom: "lBfrtip",
        buttons: [
          {
            extend: "csv",
            text: "Export CSV",
            fieldSeparator: ";"
          }
        ],
        select: true,
        language: {
          emptyTable: "Brak dostępnych danych",
          info: "Wyświetlanie _START_ do _END_ z _TOTAL_ rekordów",
          infoEmpty: "Wyświetlanie 0 do 0 z 0 rekordów",
          infoFiltered: "(filtrowane z _MAX_ wszystkich rekordów)",
          lengthMenu: "Pokaż _MENU_ rekordów",
          loadingRecords: "Ładowanie...",
          processing: "Przetwarzanie...",
          search: "Szukaj:",
          zeroRecords: "Brak pasujących rekordów",
          paginate: {
            first: "Pierwsza",
            last: "Ostatnia",
            next: "Następna",
            previous: "Poprzednia"
          }
        },
        initComplete: function () {
          $(".dataTables_filter").append(minInput).append(maxInput);
        }
      });

      $("#myTable tbody").on("click", "tr", function () {
        if ($(this).hasClass("focused")) {
          $(".delete-one").off();
          $(".delete-one").removeClass("btn");
          $(".delete-one").addClass("btn-disabled");
          // Clicked on the same row again to unfocus it
          $(this).removeClass("focused");
        } else {
          var rowData = $("#myTable").DataTable().row(this).data();
          var rowId = rowData.id;
          deleteObjectById(rowId);
          console.log("Row ID: " + rowId);
          // Clicked on a different row or first click
          $("tr.focused").removeClass("focused"); // Unfocus previously focused row
          $(this).addClass("focused"); // Focus the clicked row
          $(".delete-one").removeClass("btn-disabled");
          $(".delete-one").addClass("btn");
        }
      });

      DataTable.ext.search.push(function (settings, data, dataIndex) {
        let min = $("#min-value").val();
        let max = $("#max-value").val();
        let date = data[5];

        if (
          (min === "" && max === "") ||
          (min === "" && date <= max) ||
          (min <= date && max === "") ||
          (min <= date && date <= max)
        ) {
          return true;
        }
        return false;
      });

      $(minInput)
        .add(maxInput)
        .on("change", function () {
          $("#myTable").DataTable().draw();
        });
    }
  });
});

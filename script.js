// ensures that the javascript will not run until the html has loaded
$(document).ready(function() {
    // when the search button is clicked
    $("#search-button").on("click", function() {
      // define a variable called searchValue that will get the name of the city that the user has entered
      var searchValue = $("#search-value").val();
  
      // clear input box
      $("#search-value").val("");
      // call function searchWeather with the value (the city) that the user has typed in
      searchWeather(searchValue);
    });
  
    // when a history option (cities from previous searches) is clicked under the listed items 
    $(".history").on("click", "li", function() {
      // the function searchWeather will run for the value of the clicked city
      searchWeather($(this).text());
    });
  
    // define a function called makeRow that will run when there is text
    function makeRow(text) {
      // add a list and assign the text from the city that was entered to the list
      var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
      // render the name of the city to the page
      $(".history").append(li);
    }
  
    // when function searchWeather is called with the searchValue of the city that was entered
    function searchWeather(searchValue) {
      // perform an AJAX call to the Open Weather Map API to obtain the weather for that city
      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
        // return the data in json format
        dataType: "json",
        // if the function is successful, run function with the parameter called data
        success: function(data) {
          // create history link for this search
          if (history.indexOf(searchValue) === -1) {
            history.push(searchValue);
            window.localStorage.setItem("history", JSON.stringify(history));
            // make the history into a new row on the webpage
            makeRow(searchValue);
          }
          
          // clear any old content
          $("#today").empty();
  
          // create html content for current weather by adding a new class and setting it with the name of the new city and the date
          var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
          // dynamically create a new class called card using jquery
          var card = $("<div>").addClass("card");
          // dynamically create a new class and enter in the text Wind Speed with the API element data.wind.speed and the text MPH;
          var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
          // dynamically create a new class and enter in the text Humidity with the API element data.main.humidity and the text %;          
          var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
          // dynamically create a new class and enter in the text Temperature with the API element data.main.temp and the text °F;          
          var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
          // dynamically create a new class
          var cardBody = $("<div>").addClass("card-body");
          // dynamically create an image tag and set it to the API with the data.weather icon
          var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  
          // merge and add to page
          title.append(img);
          cardBody.append(title, temp, humid, wind);
          card.append(cardBody);
          $("#today").append(card);
  
          // call follow-up api endpoints
          getForecast(searchValue);
          getUVIndex(data.coord.lat, data.coord.lon);
        }
      });
    }
    
    // run the function getForecast with the parameter searchValue
    function getForecast(searchValue) {
      // perform an AJAX call to get the information from the API
      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
        // return the data in json format
        dataType: "json",
        // if the funtion is successful,
        success: function(data) {
          // overwrite any existing content with title and empty row
          $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
  
          // loop over all forecasts (by 3-hour increments)
          for (var i = 0; i < data.list.length; i++) {
            // only look at forecasts around 3:00pm
            if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
              // create html elements for a bootstrap card
              var col = $("<div>").addClass("col-md-2");
              var card = $("<div>").addClass("card bg-primary text-white");
              var body = $("<div>").addClass("card-body p-2");
  
              var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
  
              var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
  
              var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
              var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
  
              // merge together and put on page
              col.append(card.append(body.append(title, img, p1, p2)));
              $("#forecast .row").append(col);
            }
          }
        }
      });
    }
  
    // perform the function getUVIndex with the parameters lat and long by
    function getUVIndex(lat, lon) {
      // sending an AJAX call to the API
      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=7ba67ac190f85fdba2e2dc6b9d32e93c&lat=" + lat + "&lon=" + lon,
        // return the data in json format
        dataType: "json",
        // if the call is successful, perform the function below with the parameter data
        success: function(data) {
          // create a p tag for the variable uv and get the text for the UV Index;
          var uv = $("<p>").text("UV Index: ");
          // create a button and get the text for the data
          var btn = $("<span>").addClass("btn btn-sm").text(data.value);
          
          // change color depending on uv value
          if (data.value < 3) {
            btn.addClass("btn-success");
          }
          else if (data.value < 7) {
            btn.addClass("btn-warning");
          }
          else {
            btn.addClass("btn-danger");
          }
          
          $("#today .card-body").append(uv.append(btn));
        }
      });
    }
  
    // get current history, if any
    var history = JSON.parse(window.localStorage.getItem("history")) || [];
  
    if (history.length > 0) {
      searchWeather(history[history.length-1]);
    }
  
    for (var i = 0; i < history.length; i++) {
      makeRow(history[i]);
    }
  });
  
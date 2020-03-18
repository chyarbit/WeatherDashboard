// ensures that the javascript will not run until the html(DOM) has loaded
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
      // using jQuery, create an li tag and add attributes to that tag.  Adding a class and the text of whatever variable that we are passing in.
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
        // if the function is successful, run function with the parameter called data.  success is used rather than .then.  response from ajax call can be named whatever you want.  
        success: function(data) {
          console.log(data);
          console.log(data.main.feels_like);
          // if there is a history and if it does not exist, then push the values to the webpage
          if (history.indexOf(searchValue) === -1) {
            history.push(searchValue);
            // push the history to the local story as well
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
          // add feature
          var feelsTemp = $("<p>").addClass("card-text").text("Feels Like Temperature: " + data.main.feels_like + " °F");
          // dynamically create a new class
          var cardBody = $("<div>").addClass("card-body");
          // dynamically create an image tag and set it to the API with the data.weather icon
          var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  
          // merge and add to page
          // add image div to the title div
          title.append(img);
          // add title, temp, feelsTemp, humid, and wind to the cardBody div
          cardBody.append(title, temp, feelsTemp, humid, wind);
          // append the cardBody with all of the new info to the card
          card.append(cardBody);
          // append the card to the div that has the id today
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
        // if the function is successful,
        success: function(data) {
          console.log(data);
          // overwrite any existing content with title and empty row
          $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
  
          // loop over all forecasts (by 3-hour increments)
          for (var i = 0; i < data.list.length; i++) {
            // find 3:00 pm data and bring data for that time only to show in the 5 day forecast
            if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
              // create html elements for a bootstrap card and add the names of the classes
              var col = $("<div>").addClass("col-md-2");
              var card = $("<div>").addClass("card bg-primary text-white");
              var body = $("<div>").addClass("card-body p-2");
  
              // create a variable called title via jquery, add in a class called card-title and add in the text by converting it to a string
              var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
              // create an image variable that will pick up the icon off the API call by concatanating the information
              var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
  
              // creating new variables, adding classes, giving it text with the data points
              var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
              var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
  
              // merge together and render to the page
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
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=600327cb1a9160fea2ab005509d1dc6d&lat=" + lat + "&lon=" + lon,
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
          // append information to the page
          $("#today .card-body").append(uv.append(btn));
        }
      });
    }
  
    // get current history, if any.  parse means to convert.  local storage only takes strings so we need to take the history array and parse it into a string via the json format so that local storage will accept it.  
    var history = JSON.parse(window.localStorage.getItem("history")) || [];
    
    // if there isn't any history
    if (history.length > 0) {
      // run the function searchWeather for the length of the array -1 since the array starts counting at 0
      searchWeather(history[history.length-1]);
    }
    // creating a loop to make a row for each new history iteration
    for (var i = 0; i < history.length; i++) {
      makeRow(history[i]);
    }
  });
  
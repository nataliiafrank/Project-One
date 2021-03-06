//-------------------------------------------------------------------------------------------
//  Firebase db Tree
//
//     /mealPlanner
//         |
//         -> Epoch
//               |
//               -> UserID
//                     |
//                     -> breakfast
//                     -> lunch
//                     -> dinner
//
//     /favorite
//        |
//        -> UserID
//               |
//               -> breakfast
//                    -> yummlyID
//                    -> random  [true/false]
//               -> lunch
//                    -> yummlyID
//                    -> random  [true/false]
//               -> dinner
//                    -> yummlyID
//                    -> random  [true/false]
//
//     /activeSearch
//        |
//        -> UserID
//               |
//               -> searchCriteria
//                   |
//                   -> selectedEpoch: 
//                   -> selectedMeal:  [breakfast/lunch/dinner]
//                   -> selectedYummlyID:
//
//
//-------------------------------------------------------------------------------------------

var userID = "";
var userName = "";

//-------------------------------------------------------------------------------------------
// Global variables
//-------------------------------------------------------------------------------------------
var ourAPIid = "4dced6d2";
var ourAPIkey = "1a7e0fea32a0ad94892aaeb51b858b48";

var startOfDay = moment().startOf('day');

var breakfast = {
    yummlyID: " ",
    random: "false"
};

var lunch = {
    yummlyID: " ",
    random: "false"
};

var dinner = {
    yummlyID: " ",
    random: "false"
};

var mealPlan = {
    breakfast,
    lunch,
    dinner
};

var user = {
    name: "test",
    mealPlan
};

// I am so sorry I'm inserting this ugly object here.. 
// It holds all the data needed for the google calendar event
const eventObj = {
    summary: '',
    description: '',
    startTime: '',
    endTime: ''
}


//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function createAweekOfEpochKeys() {


    mealPlanner.child( userID ).once('value',function(snapshot) {
        var i_epoch = parseInt(moment(startOfDay).format('X'));
        //
        // Remove old scheduled meals from the db for this user
        //
        snapshot.forEach( function(childSnapshot)  {
            var db_epoch = parseInt(childSnapshot.key);
            if ( db_epoch < i_epoch ) {
                childSnapshot.ref.remove();
            }
        });

        //
        // Check the next 7 days of scheduled meals
        //   Read if the day exists
        //   Create if the day does not exist
        //
        var userExists = (snapshot.val() !== null);
        for (i=0; i<7; i++) {
            var epoch = moment(startOfDay).add(i, 'days');
            var epochStr = moment(epoch).format("X");
    
            var breakfastYummlyID = " ";
            var lunchYummlyID = " ";
            var dinnerYummlyID = " ";

            if (userExists) {
                var epochExists = (snapshot.child(epochStr).val() !== null);
                if (epochExists) {
                    breakfastYummlyID = snapshot.child(epochStr).val().breakfast.yummlyID;
                    lunchYummlyID = snapshot.child(epochStr).val().lunch.yummlyID;
                    dinnerYummlyID = snapshot.child(epochStr).val().dinner.yummlyID;
                }
                else {
                  var breakfast = user.mealPlan.breakfast
                  mealPlanner.child(userID+"/"+epochStr).update({
                      breakfast
                  });
                  var lunch = user.mealPlan.lunch
                  mealPlanner.child(userID+"/"+epochStr).update({
                      lunch
                  });
                  var dinner = user.mealPlan.dinner
                  mealPlanner.child(userID+"/"+epochStr).update({
                     dinner 
                  });
                }
            }
            else {
                var breakfast = user.mealPlan.breakfast
                mealPlanner.child(userID+"/"+epochStr).update({
                    breakfast
                });
                var lunch = user.mealPlan.lunch
                mealPlanner.child(userID+"/"+epochStr).update({
                    lunch
                });
                var dinner = user.mealPlan.dinner
                mealPlanner.child(userID+"/"+epochStr).update({
                   dinner 
                });
            }
            buildDayOfMeals(i, epoch, breakfastYummlyID, lunchYummlyID, dinnerYummlyID);

        }
    });
}

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function buildDayOfMeals( i, epoch, breakfastYummlyID, lunchYummlyID, dinnerYummlyID ) {
    var epochStr = moment(epoch).format("X");

    var startDay = moment(epoch).format("MMM DD");
    var dayName = moment(epoch).format("dddd");
    var jq_day = $("#day" + i);
    jq_day.attr("value",epochStr);
    jq_day.prepend("<p class='date'>" + startDay + "</p>");
    jq_day.prepend("<p class='day-name'>" + dayName + "</p>");

    // Breakfast
    var jq_newBreakfastInput = $("#breakfast" + i );
    jq_newBreakfastInput.attr( "value", "breakfast" );
    jq_newBreakfastInput.attr( "epoch", epochStr );
    jq_newBreakfastInput.attr( "yummlyid", breakfastYummlyID );
    if ( breakfastYummlyID == " " ) {
        jq_newBreakfastInput.removeClass("meal");
        jq_newBreakfastInput.addClass("no-meal");
    }
    else {
        jq_newBreakfastInput.removeClass("no-meal");
        jq_newBreakfastInput.addClass("meal");
    }

    // Lunch
    var jq_newLunchInput = $( "#lunch" + i );
    jq_newLunchInput.attr( "value", "lunch" );
    jq_newLunchInput.attr( "epoch", epochStr );
    jq_newLunchInput.attr( "yummlyid", lunchYummlyID );
    if ( lunchYummlyID == " " ) {
        jq_newLunchInput.removeClass("meal");
        jq_newLunchInput.addClass("no-meal");
    }
    else {
        jq_newLunchInput.removeClass("no-meal");
        jq_newLunchInput.addClass("meal");
    }

    // Dinner
    var jq_newDinnerInput = $( "#dinner" + i );
    jq_newDinnerInput.attr( "value", "dinner" );
    jq_newDinnerInput.attr( "epoch", epochStr );
    jq_newDinnerInput.attr( "yummlyid", dinnerYummlyID );
    if ( dinnerYummlyID == " " ) {
        jq_newDinnerInput.removeClass("meal");
        jq_newDinnerInput.addClass("no-meal");
    }
    else {
        jq_newDinnerInput.removeClass("no-meal");
        jq_newDinnerInput.addClass("meal");
    }

}


//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function genRating(rating) {
    let html = `<div> Rating: <b id='rating' value=${rating} <span>`;
    for (var i = 1, j = rating; i <= j; i++) {
        html += '<i class="fa fa-star" aria-hidden="true"></i>';
    }
    html += '</span></b></div>';
    return html;
}

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function selectFavorite( event ) {
    var selected = $(this);
    var selectedMeal = selected.attr("value");
    var selectedYummlyID = selected.attr("yummlyid");

    displayRecipeModal( selectedMeal, "0", selectedYummlyID );
}

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function displayRecipeModal( selectedMeal, selectedEpoch, selectedYummlyID ) {

    var queryURL = "https://api.yummly.com/v1/api/recipe/" +
                  selectedYummlyID +
                  "?_app_id=" + ourAPIid +
                  "&_app_key=" + ourAPIkey;

    $.ajax({
        type: 'GET',
        url: queryURL,
    }).then(function (result) {
        var img = result.images[0].hostedSmallUrl;
        var recipe_name = result.name;
        var rating = result.rating;
        var cookTime = result.totalTimeInSeconds;
        var formattedCookTime = moment.utc(cookTime * 1000).format('HH:mm:ss');
        var link = result.attribution.url;

        var ingredientList = result.ingredientLines;
        var ingredientListArray = [];
        ingredientList.forEach(function (element) {
            ingredientListArray.push(element);
        });
        var formattedIngredients = ingredientListArray.join(', ');

        // Adding the recipe name to my eventObj called with eventObj.description
        eventObj.description = recipe_name;


        $("#myModal .modal-title").text(recipe_name);
        $("#myModal .modal-title").empty().append(`<div class='modal-title-info'>${recipe_name}</div>` +
           `<div class='modal-body-info'>` +
               `<div class="row">` +
                   `<div class="col-sm-7">` +
                       `<img src=${img}>` +
                       `<p class="modalRating">` + genRating(rating) + `</p>` + 
                       `<p class="modalCookTime"><b>Cook Time: </b>${formattedCookTime}</p>` +
                       `<p class="modalIngredientList"><b>Ingredients: </b>${formattedIngredients}</p>` +
                    `</div>` +
                   `<div class="col-sm-5">` +
                       `<p class="btn btn-primary btn-info" id="getRecipeBtn"><a target="_blank" href=${link}><span class="glyphicon glyphicon-new-window"></span> See Full Recipe</a></p>` +
                       `<p clase="btn btn-primary btn-info" id="selectRecipeBtn" data-value=${selectedYummlyID} style="cursor:pointer"><span class='glyphicon glyphicon-search'></span> New ${selectedMeal}</p>` +
                       `<p class="btn btn-primary btn-info" id="scheduleMealBtn" scheduled-meal=${selectedMeal} scheduled-time=${selectedEpoch}><span class="glyphicon glyphicon-calendar"></span> Schedule ${selectedMeal}</p>` +
                    `</div>` +
                `</div>` +
           `</div>`);
        if ( selectedEpoch != 0 ) {
          $("#selectRecipeBtn").addClass("visible");
          if ( auth.currentUser.emailVerified ) {
              $("#scheduleMealBtn").addClass("visible");
          }
          else {
              $("#scheduleMealBtn").addClass("hidden");
          }
        }
        else {
          $("#selectRecipeBtn").addClass("hidden");
          $("#scheduleMealBtn").addClass("hidden");
        }

        $("#myModal").modal("show");

        $("#selectRecipeBtn").on( "click", function () {
            window.location.href="search.html";
        });
        
        $("#scheduleMealBtn").on( "click", function () {
            scheduledMeal = $(this).attr("scheduled-meal");
            scheduledTime = $(this).attr("scheduled-time");
            var rfc339Time  = 0;
            
            if( scheduledMeal == "breakfast" ) addSeconds = 8*60*60;
            if( scheduledMeal == "lunch" ) addSeconds = 12*60*60;
            if( scheduledMeal == "dinner" ) addSeconds = 18*60*60;

            rfc339Time = moment.unix(parseInt(selectedEpoch)+addSeconds).format("YYYY-MM-DDTHH:mm:ssZ");

            // Updating my eventObj with meal info
            eventObj.summary = scheduledMeal;
            eventObj.startTime = rfc339Time;
            eventObj.endTime = moment.unix(parseInt(selectedEpoch)+(addSeconds+60*60)).format("YYYY-MM-DDTHH:mm:ssZ");

            // Adding click handler here for google authentication
            handleAuthClick();


        });
    });
}

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function selectMeal( event ) {
   var selected = $(this);
   var selectedMeal = selected.attr("value");
   var selectedEpoch = selected.attr("epoch");
   var selectedYummlyID = selected.attr("yummlyid");

   event.preventDefault();


   var searchCriteria = {
        selectedEpoch,
        selectedMeal,
        selectedYummlyID
   }
   activeSearch.child(userID).update({
       searchCriteria
   });

   if ( selectedYummlyID == " " ) { 
       window.location.href="search.html";
    }
    else {
       displayRecipeModal( selectedMeal, selectedEpoch, selectedYummlyID );
    }

}

//-------------------------------------------------------------------------------------------
//  constanly check the data base for an updated favorites 
//  and disply if within view
//-------------------------------------------------------------------------------------------
function buildFavoriteMealArea( meal ) {


    favorite.child( userID+"/"+meal ).on('value',function(snapshot) {
        var exists = (snapshot.val() !== null);
        if ( exists ) {
            var yumID = snapshot.val().yummlyID;
            var queryURL = "https://api.yummly.com/v1/api/recipe/" +
                           yumID +
                           "?_app_id=" + ourAPIid +
                           "&_app_key=" + ourAPIkey;

            $.ajax({
                type: 'GET',
                url: queryURL,
            }).then(function (result) {

                var jq_divID = $("#favorite-"+meal);
                jq_divID.empty();
                jq_divID.attr( "yummlyid", yumID );
                jq_divID.attr("style", "cursor:pointer");
                jq_divID.append("<h3>"+meal+"</h3>");
                jq_divID.append("<p>"+result.name+"</p>");
                jq_divID.append("<img src="+result.images[0].hostedLargeUrl+">");

            });
        }
    });

}

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function buildFromRandomMeal( meal ) {

    var search_params = meal;
    var queryURL = "https://api.yummly.com/v1/api/recipes" +
        "?_app_id=" + ourAPIid +
        "&_app_key=" + ourAPIkey +
        "&q=" + search_params;

    //  if the user has not selected a favorite meal then randomnly selected one
    favorite.child( userID+"/"+meal ).once('value',function(snapshot) {
        var exists = (snapshot.val() !== null);
        if (!exists || snapshot.val().random) {

            $.ajax({
                type: 'GET',
                url: queryURL,
            }).then(function (result) {
                var result_length = result.matches.length;
                var randomNumber = Math.floor(Math.random() * result_length);

                if (meal == "breakfast") {
                    breakfast.yummlyID = result.matches[randomNumber].id;
                    breakfast.random = true;
                    favorite.child(userID).update({
                        breakfast
                    });
                }
                else if (meal == "lunch") {
                    lunch.yummlyID = result.matches[randomNumber].id;
                    lunch.random = true;
                    favorite.child(userID).update({
                        lunch
                    });
                }
                else if (meal == "dinner") {
                    dinner.yummlyID = result.matches[randomNumber].id;
                    dinner.random = true;
                    favorite.child(userID).update({
                        dinner
                    });
                }
            }); 

        }
    });
};

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function removeActiveSearchDB () {
    var ref = activeSearch.child(userID).once( 'value', function ( snapshot ) {
        snapshot.ref.remove();
    });
 };

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function randomMeals() {
    var meal = "default";
    for (i=0; i<3; i++) {
        if (i == 0) meal = "breakfast";
        if (i == 1) meal = "lunch";
        if (i == 2) meal = "dinner";
        buildFromRandomMeal( meal );
    }
};

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
function homepageControl() {
    
    createAweekOfEpochKeys();
    removeActiveSearchDB();
    $("#username").text(userName);
    for (i=0; i<3; i++) {
       if (i == 0) meal = "breakfast";
       if (i == 1) meal = "lunch";
       if (i == 2) meal = "dinner";
       buildFavoriteMealArea( meal );
    }

    $(".meal").on( "click", selectMeal );
    $(".no-meal").on( "click", selectMeal );
    $("#random-meals").on( "click", randomMeals );
    $("#favorite-breakfast").on( "click", selectFavorite );
    $("#favorite-lunch").on( "click", selectFavorite );
    $("#favorite-dinner").on( "click", selectFavorite );
    $("#username").on("click", function (){
        window.location.href = "profile.html";
    });
    
};

//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
randomMeals();

$(document).ready( function() {
    
    auth.onAuthStateChanged( function(user) {
    
        if (user) {
            // User is signed in.
            usersRef.child(user.uid).once( 'value', function(snapshot) {
                userID = user.uid;
                userName = snapshot.val().userName;
                homepageControl();
            });

        }
    });
});
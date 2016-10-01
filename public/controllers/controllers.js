
var bookControllers = angular.module('bookControllers', []);
bookControllers.controller('bookListCtrl', ['$scope', '$http', 
	function($scope, $http){
		var refresh = function(){
			$http.get('/booklist').success(function(response){
				// alert('Get the book list data');
				$scope.booklist = response.booklist;

				if (response.name) {
					$scope.user = { name: response.name, id: response.id };
					// $scope
				}
				if ($scope.user) {
					document.getElementById('username').style.display = "inline-block";
					document.getElementById('enter').style.display = "none";

				}else{
					document.getElementById('username').style.display = "none";
					document.getElementById('enter').style.display = "inline-block";
				}
				// document.getElementById('username').style.display = "none";
	   //  		document.getElementById('enter').style.display = "block";
			});
		}
	    $scope.orderProp = 'date';
	    $scope.sortby = 'Date';

	    refresh();

	    $scope.signin = function(){
	    	if ($scope.user.name && $scope.user.pwd) {
	    		$http.post('/signin', $scope.user).success(function(response){
		    		if (response.success) {
		    			$scope.user = { name: response.name, id: response.id };
		    			// $scope.id = response.id;
		    			
		    			$http.post('/setcookies', $scope.user).success(function(response){
		    				document.getElementById('username').style.display = "inline-block";
		    				document.getElementById('enter').style.display = "none";
		    			});
		    			// document.getElementById('top1').style.margin-left = 60 + "%";
		    		}else{
		    			alert(response.msg);
		    		}
		    	});
	    	}else{
	    		alert("There should not be empty field.");
	    	}
	    	
	    }
	    $scope.signup = function(){
	    	if ($scope.user.name && $scope.user.pwd) {
	    		$http.post('/signup', $scope.user).success(function(response){
		    		if (response.success) {
		    			// $scope.name = response.name;
		    			// $scope.id = response.id;
		    			$scope.user = { name: response.name, id: response.id };
		    			$http.post('/setcookies', $scope.user).success(function(response){
		    				document.getElementById('username').style.display = "inline-block";
		    				document.getElementById('enter').style.display = "none";
		    			});
		    		}else{
		    			alert(response.msg);
		    		}
		    		// alert(response.msg);
		    	});
	    	}else{
	    		alert("There should not be empty field.");
	    	}
	    	
	    }
	    $scope.logout = function(){
	    	$http.get('/logout').success(function(res){	
		    	delete $scope.user;
		    	document.getElementById('username').style.display = "none";
		    	document.getElementById('enter').style.display = "inline-block";
		    	refresh();
	    	});

	    }
	    $scope.addBook = function(){
	    	if ($scope.user) {
	    		// alert($scope.book.title);
	    		if ($scope.book.title && $scope.book.author && $scope.book.description) {
	    			// alert("in1");
	    			$scope.book.post = $scope.user.name;
	    			// alert("in2");
	    			$scope.book.postId = $scope.user.id;
	    			// alert($scope.user.name);
		    		$http.post('/addbook', $scope.book).success(function(response){
		    			if (response.success) {
		    				alert("Success!");
		    				refresh();
		    			}else{
		    				alert(response.msg);
		    			}
		    		});
	    		}else{
	    			alert('There should not be empty field.');
	    		}
	    	}else{
	    		alert('Sorry, you should log in first.');
	    	}
	    	document.getElementById("form1").reset();
	    	document.getElementById("form2").reset();
	    }
	    $scope.sortByDate = function(){
	    	$scope.orderProp = 'date';
	    	$scope.sortby = 'Date';
	    }
	    $scope.sortByTitle = function(){
	    	$scope.orderProp = 'title';
	    	$scope.sortby = 'Title';
	    }
	    $scope.sortByAuthor = function(){
	    	$scope.orderProp = 'author';
	    	$scope.sortby = 'Author';
	    }
	    $scope.sortByUser = function(){
	    	$scope.orderProp = 'post';
	    	$scope.sortby = 'Post User';
	    }
	    $scope.sortByRating = function(){
	    	$scope.orderProp = '-rating';
	    	$scope.sortby = 'rating';
	    }
	}]);

bookControllers.controller('bookReviewCtrl', ['$scope', '$routeParams', '$http',
	function($scope, $routeParams, $http){
		var refresh = function(){
			$http.post('/onebook', {id: $routeParams.bookId}).success(function(response){
				if (response.success) {
					$scope.book = response.book;
					// alert(response.book.cover);
					$scope.reviews = response.reviews;
					// alert(response.reviews);
					if (response.user) {
						$scope.user = response.user;
					}
				}else{
					alert(response.response);
				}
				// document.getElementById('username').style.display = "none";
	   //  		document.getElementById('enter').style.display = "block";
			});
		}
		refresh();

		$scope.addReview = function(){
			$scope.review.bookId = $scope.book._id;
			$scope.review.title = $scope.book.title;
			$scope.review.date = new Date();
			if ($scope.review.body) {
				$http.post('/addreview', $scope.review).success(function(response){
					refresh();
					document.getElementById("form3").reset();
				});
			}	
		}

		$scope.rateBook = function(){
			// var bookrate = {bookId: $scope.book.bookId, rating: $scope.rating};
			// alert($scope.rating);
			if (typeof $scope.rating == "undefined") {
				document.getElementById("form4").reset();
				// alert("The rating should in the range between 1 and 5");
				return;
			}
			var newrating = ($scope.book.rating * $scope.book.ratenum + $scope.rating)/($scope.book.ratenum + 1);
			var newratenum = $scope.book.ratenum + 1;
			newrating = newrating.toFixed(1);
			$http.post('/rateBook', { bookId: $scope.book._id, rating: newrating, ratenum: newratenum }).success(function(res){
				$scope.book.rating = newrating;
				$scope.book.ratenum = newratenum;
				document.getElementById("form4").reset();
			});
		}


	}]);
// bookControllers.controller('userCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){

// }]);

bookControllers.controller('userCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
	var refresh = function(){
		$http.post('/oneuser', {id: $routeParams.userId}).success(function(response){
			if (response.success) {
				$scope.booklist = response.books;
				$scope.reviewlist = response.reviews;
				if (response.user) {
					$scope.user = response.user;
				}
			}else{
				alert(response.response);
			}
			
		});
		$scope.orderProp = 'date';
	}
	refresh();

	$scope.edit = function(id){
		// alert(id);
		$http.post('/edit', {bookId: id}).success(function(res){
			$scope.editbook = res;
		});
	}

	$scope.updateBook = function(){
		$scope.editbook.date = new Date();
		$http.post('/update', $scope.editbook).success(function(res){
			alert("success");
			refresh();
		});
	}


}]);


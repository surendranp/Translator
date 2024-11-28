$(document).ready(function () {
    function updateNavbarStyles() {
        if ($(window).width() <= 992) {
            if ($('.navbar').hasClass('scrolled')) {
                $('.navbar-collapse').css('background-color', '#0f1010e2');
                $('.nav-link').css('color', 'white'); // Set nav link color for mobile
            } else {
                $('.navbar-collapse').css('background-color', 'white');
                $('.nav-link').css('color', 'black'); // Reset nav link color for mobile
            }
        } else {
            // Reset background color and link color for desktop view
            $('.navbar-collapse').css('background-color', 'transparent'); 
            if ($('.navbar').hasClass('scrolled')) {
                $('.nav-link').css('color', 'white'); // Set nav link color on scroll
            } else {
                $('.nav-link').css('color', 'black'); // Reset nav link color
            }
        }
    }

    function updateTogglerIconColor() {
        if ($('.navbar').hasClass('scrolled')) {
            $('.navbar-toggler-icon').css('background-color', '#fff'); // Change to white when scrolled
        } else {
            $('.navbar-toggler-icon').css('background-color', 'transparent'); // Change to transparent at the top
        }
    }

    // Change the navbar background and text color when scrolled
    $(window).scroll(function () {
        if ($(this).scrollTop() > 10) {
            // For nav bar 
            $('.navbar').addClass('scrolled');
            // For logo
            $('.navbar-brand img').attr('src', './images/logo-1.png'); 
            updateTogglerIconColor();
            updateNavbarStyles();
        } else {
            $('.navbar').removeClass('scrolled');
            $('.navbar-brand img').attr('src', './images/logo-Black.png');
            updateTogglerIconColor();
            updateNavbarStyles();
        }
    });

    // Update styles on window resize
    $(window).resize(function () {
        updateNavbarStyles();
        updateTogglerIconColor(); 
    });

    // Initial call to set styles based on initial window size
    updateNavbarStyles();
    updateTogglerIconColor(); 
});

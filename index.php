<?php
    // require_once 'load_env.php';
    // loadEnv(__DIR__ . '/.env');    
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Glenview</title>

        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="assets/css/style.css" />

        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCLYuOmekHy21jqe40OUxSRDo-R505fVig"></script>

    </head>
    <!-- onload="initMap()" -->
    <body>
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid px-5">
                <a class="navbar-brand me-4" href="#">
                    <img src="assets/images/logo2.png" alt="Glenview Logo" style="max-height: 3rem" />
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="#">Start</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Help</a>
                        </li>
                    </ul>
                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li class="me-3">
                            <div class="input-group me-3">
                                <input type="text" class="form-control" placeholder="Name, Number, address" aria-label="Recipient's username" aria-describedby="button-addon2" />
                                <button class="btn btn-success" type="button" id="button-addon2">Search</button>
                            </div>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-outline-light me-2" href="#">Login</a>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-outline-warning" href="#">Register</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container mt-5">
            <div class="d-flex align-items-center justify-content-between">
                <h3 class="mb-3">Cumulative Rainfall Map</h3>
                <div class="weather-filters">
                    <ul class="list-group list-group-horizontal">
                        <li class="list-group-item">
                            <button type="button" class="btn btn-primary">Hourly</button>
                        </li>
                        <li class="list-group-item">Today</li>
                        <li class="list-group-item">Weekly</li>
                        <li class="list-group-item">Monthly</li>
                    </ul>
                </div>
            </div>
            <div class="map-container">
                <div id="map" style="height: 600px;width: 100%"></div>
            </div>
            <div class="mt-5">
                <div id="main" style="width: 100%; height: 500px"></div>
                <div class="row mt-2">
                    <div class="col-md-10 flood-info-data mx-auto">
                        <div class="flooding-item d-flex align-items-center justify-content-between">
                            <div>Major Flooding</div>
                            <div>9 FT</div>
                        </div>
                        <div class="flooding-item d-flex align-items-center justify-content-between">
                            <div>Moderate Flooding</div>
                            <div>8 FT</div>
                        </div>
                        <div class="flooding-item d-flex align-items-center justify-content-between">
                            <div>Minor Flooding</div>
                            <div>7.5 FT</div>
                        </div>
                        <div class="flooding-item d-flex align-items-center justify-content-between">
                            <div>Action</div>
                            <div>7 FT</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="container pt-4 my-md-5 pt-md-5 border-top">
            <div class="row">
                <div class="col-12 col-md">
                    <a>Village of Glenview</a><br/>
                    <a href="http://www.icons8.com">Icons by icons8</a>           
                </div>
                <div class="col-12 col-md">
                    <h5>About This Site</h5>
                    <p class="mb-3">This site allows you to search permit data on-line.  You may also create an account to submit permits, track the progress, and make payments.</p>
                </div>
                <div class="col-12 col-md">
                    <h5>Need help?</h5>
                    <p>We’ve created a webpage that explains each permit or registration step-by-step and gives you detailed information about fees, required forms and related items.</p>
                    <a class="d-block mb-3" href="/Help.aspx">Online Help &gt;</a>
                </div>
                <div class="col-12 col-md">
                    <h5>Report a Problem</h5>
                    <p class="mb-3">Trouble with your application or inspection request?  Please report your problem to <a class="text-nowrap" href="mailto:resolutioncenter@glenview.il.us?Subject=OneStop%20App%20Feedback">resolutioncenter@glenview.il.us</a></p>
                </div>
            </div>
            <div>
                
            </div>
        </footer>
        <script src="assets/js/jquery.min.js"></script>
        <script src="assets/bootstrap/js/bootstrap.min.js"></script>
        <script src="assets/js/echarts.min.js"></script>
        <script src="assets/js/mapData.js"></script>
        <script src="assets/js/chart.js"></script>
        <script src="assets/js/generateData.js"></script>
    </body>
</html>
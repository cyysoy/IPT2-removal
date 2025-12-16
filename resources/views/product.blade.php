<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>My Products</title>
    
    
    <link href="{{ mix('css/app.css') }}" rel="stylesheet">
</head>
<body>
    
    <div id="products"></div>
    <script src="{{ mix('js/app.js') }}"></script>
</body>
</html>

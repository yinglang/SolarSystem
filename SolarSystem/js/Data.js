var Data = {};
Data.Dis = { Mercury :58, Venus : 108, Earth :150, Mars:228,Jupiter: 778, Saturn :1427,Uranus:2870, Neptune:4497};  // million km
Data.Radius = {Mercury : 24.40,Venus:60.51,Earth:63.78,Mars:33.97,Jupiter:714.92,Saturn:602.68,Uranus:255.59,Neptune:247.66};  // hundred km
Data.BPeriod= {"Mercury":88,"Venus":225,"Earth":369,"Mars":687,"Jupiter":4333,"Saturn":10759,"Uranus":30685,"Neptune":164.8 * 369}; // day
Data.SPeriod= {"Mercury":58.6,"Venus":243,"Earth":1,"Mars":1,"Jupiter":0.4,"Saturn":0.4,"Uranus":0.4,"Neptune":0.75};           // day
Data.ShaftAngle={Mercury :0.01, Venus : 177.36, Earth :23.439, Mars:25.19,Jupiter: 3.13, Saturn :26.73,Uranus:97.77, Neptune:28.32};
Data.mass={Mercury :3.3, Venus : 48.69, Earth :59.736, Mars:6.2419,Jupiter: 19000, Saturn :5680,Uranus:868.3, Neptune:1024.7,Moon:0.7349, Sun:19890000};
Data.map = {
    Mercury: "./images/Mercury.jpg",
    Venus: "./images/venus.jpg",
    Earth: "./images/earth_surface_2048.jpg",
    Mars: "./images/MarsV3-Shaded-2k.jpg",
    Jupiter: "./images/realj2k.jpg",
    Saturn: "./images/saturn_bjoernjonsson.jpg",
    Uranus: "./images/uranus.jpg",
    Neptune: "./images/neptune.jpg",
    Pluto: "./images/pluto.jpg",  //- have to exaggerate his size or we'll never see the little guy
    Sun:"./images/sun_surface.jpg",  // not use for sun
    Moon:"./images/moon_1024.jpg",
    SatRing:"./images/SatRing.png"
};

Data.SunData = {r:6963.00, SPeriod:27.275};
Data.MoonData = {r:17.37,dis:0.3844,BPeriod:30, SPeriod:30};

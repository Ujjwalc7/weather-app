import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.set('view engine', 'ejs');
const port = 3000;
const geoCode = "https://api.openweathermap.org/geo/1.0/direct";
const apiKey=process.env.OPEN_WEATHER_API_KEY;
const weatherCode = "https://api.openweathermap.org/data/2.5/weather";
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const getTime = (seconds) => {const timestamp = seconds;

    // Create a Date object from the timestamp (multiply by 1000 to convert from seconds to milliseconds)
    const date = new Date(timestamp * 1000);
    // this part is for the day month year
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const day = date.getDate();
    
    // Use Date methods to extract time components
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert hours to 12-hour format if needed
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    
    // Create a formatted time string
    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    // return ` ${formattedTime} - ${day.toString().padStart(2,'0')}/${month.toString().padStart(2,'0')
    // }/${year}`;
    return formattedTime;
    }

    const todayTime = () => {
        const d = new Date();
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convert hours to 12-hour format if needed
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        
        // Create a formatted time string
        const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        return formattedTime;
    }
    

app.get("/", (req,res)=>{
    res.render("index.ejs",{src:"icons/search-home.svg"});
})
app.post("/weather",async (req,res)=>{
    // console.log(req.body);
    try {
        const query1 = {
            params :{
                q : `${req.body.city},91`,
                appid : apiKey,
            }
        }
        const {data} = await axios.get(geoCode,query1);
        if(!data){
            throw new Error('Location not found');
        }else{
            const lat=data[0].lat;
            const lon=data[0].lon;
    
            // console.log(data);
            
            const query2 = {
                params : {
                    lat: `${lat}`,
                    lon: `${lon}`,
                    units: "metric",
                    appid: apiKey,
                }
            }
            const respose = await  axios.get(weatherCode,query2);
            // console.log(respose.data);
            const sunriseTime = getTime(respose.data.sys.sunrise);
            const sunsetTime = getTime(respose.data.sys.sunset);
    
            const weather = respose.data.weather[0].main;
            const temp = respose.data.main.temp;
            const day = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()]
            const time = todayTime()
            res.render("index.ejs", {src:`icons/${weather}.svg`,temp:Math.round(temp), day:day, time:time, 
        desc: respose.data.weather[0].description, city: req.body.city, src2:`https://openweathermap.org/img/wn/${respose.data.weather[0].icon}.png`, 
    sunriseTime:sunriseTime,sunsetTime:sunsetTime, humidity: respose.data.main.humidity, visibility: respose.data.visibility/1000, 
    wind:Math.round(respose.data.wind.speed*18/5) , })
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).render('error.ejs', { error: 'An error occurred',src:"icons/error.svg" });
    }
    // res.render("index.ejs");
})

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
})


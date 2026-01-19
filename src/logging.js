import { UAParser } from 'ua-parser-js';


export async function visit_log() {
  // get device info
  const { ua, browser, os, device }=UAParser();

  // get location info
  const location=await get_location_info();
  
  // send post request
  const data={
    "ip": location["ip"],
    "country": location["country"],
    "region": location["region"],
    "city": location["city"],
    "user_agent": ua,
    "browser": browser["name"],
    "os": os["name"],
    "device": device["type"]===undefined?"desktop":device["type"]   // undefined device type is desktop
  };

  visit_log_request(data);
}

export function upload_log(name, size) {
  // send post request
  const data={
    "visit_log_uuid": window.visit_log_uuid,
    "name": name,
    "size": size
  };

  upload_log_request(data);
}

async function get_location_info() {
  try {
    // use sample location info
    if(process.env.REACT_APP_USE_SAMPLE_LOCATION_INFO==1) {
      var response=await fetch(`${process.env.REACT_APP_API_SERVER_HOST}/location`);
    }
    
    // use real location
    else if(process.env.REACT_APP_USE_SAMPLE_LOCATION_INFO==0) {
      var response=await fetch("https://ipapi.co/json/");
    }
    const json=await response.json();

    const data={
      ip: json.ip || null,
      country: json.country || null,
      region: json.region || null,
      city: json.city || null,
    };

    return data;
  } catch(error) {
    return {
      ip: null,
      country: null,
      region: null,
      city: null,
    };
  }
}

function visit_log_request(data) {
  var request=new XMLHttpRequest();
  request.open("POST", `${process.env.REACT_APP_API_SERVER_HOST}/visit_logs`, true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  request.onload=function() {
    if(this.status>=200&&this.status<400) {
      const response=JSON.parse(this.response);

      // save uuid as global variable
      window.visit_log_uuid=response["uuid"];
    }
  };

  request.send(JSON.stringify(data));
}

function upload_log_request(data) {
  var request=new XMLHttpRequest();
  request.open("POST", `${process.env.REACT_APP_API_SERVER_HOST}/upload_logs`, true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
}



function getDays(time_code) {
    let timecode = time_code;
    let ans = parseInt(timecode/(24*60*60) + 1).toString();
    ans = ans.length == 1 ? "0" + ans : ans;
    return ans;
}

function getHours(time_code) {
    let timecode = time_code;
    timecode -= (getDays(timecode)-1) * 24 * 60 * 60;
    let ans = parseInt(timecode/(60*60)).toString();
    ans = ans.length == 1 ? "0" + ans : ans;
    return ans;
}

function getMinutes(time_code) {
    let timecode = time_code;
    timecode -= (getDays(timecode)-1) * (24 * 60 * 60) + getHours(timecode) * (60 * 60)
    let ans = parseInt(timecode/60).toString();
    ans = ans.length == 1 ? "0" + ans : ans;
    return ans;
}

function getSeconds(time_code) {
    let timecode = time_code;
    timecode -= (getDays(timecode)-1) * (24 * 60 * 60) + getHours(timecode) * (60 * 60) + getMinutes(timecode) * (60);
    let ans = timecode.toString();
    ans = ans.length == 1 ? "0" + ans : ans;
    return ans;
}


function getDateTime(time_code) {
    let date_time = "01/" + getDays(time_code) + "/2014 " + getHours(time_code) + ":" + getMinutes(time_code) + ":" + getSeconds(time_code);
    return date_time;
}

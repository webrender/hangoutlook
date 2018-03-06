var items = ['start', 'event_1', 'event_2', 'event_3', 'recent_1', 'recent_2'];

document.getElementById('start').addEventListener('focus', evt => {
    evt.target.setAttribute('placeholder', 'Enter a Hangout name')
});

document.getElementById('start').addEventListener('blur', evt => {
    evt.target.setAttribute('placeholder', 'Start or join Hangout')
});
var domain = '';
var screenSaverActive = false;
var screenSaver = () => {
  var icon = document.getElementById('icon');
  if (icon) {
    icon.style.top = `${Math.floor(Math.random() * (window.innerHeight - 265)) + 10}px`;
    icon.style.left = `${Math.floor(Math.random() * (window.innerWidth - 224)) + 10}px`;
  } else {
    var i = document.createElement ('div');
    i.id = 'icon';
    i.style.top = `${Math.floor(Math.random() * (window.innerHeight - 265)) + 10}px`;
    i.style.left = `${Math.floor(Math.random() * (window.innerWidth - 224)) + 10}px`;
    document.getElementById('screensaver').appendChild(i);
  }
    document.getElementById('screensaver').style.display = 'block';
    screenSaverActive = true;

}
var inactiveTimer, screenSaverTimer;
var setInactiveTimer = () => {
  clearTimeout(inactiveTimer);
  inactiveTimer = window.setTimeout(() => {
    clearInterval(screenSaverTimer);
    screenSaver();
    screenSaverTimer = window.setInterval(screenSaver, 5000);
  }, 1800000);
};
var clearScreenSaver = () => {
  if (screenSaverActive) {
    document.getElementById('screensaver').style.display = 'none';
    screenSaverActive = false;
    clearTimeout(inactiveTimer);
    clearInterval(screenSaverTimer);
    setInactiveTimer();
  }
};
document.addEventListener('mousemove', clearScreenSaver);
document.addEventListener('keydown', clearScreenSaver);

var clickHandler = e => {
    e.preventDefault();
    var link = e.target;
    while (link.tagName != 'A') {
        link = link.parentNode;
    }
  
    if (e.altKey && link.href.indexOf('hangouts/_' > -1))
      link.href = link.href.replace('hangouts/_', 'present');
  
    addRecentMeeting(
      link.href,
      () => {window.location = link.href}
    );
}
var recentMeetings = () => {
    if (window.localStorage.recentMeetings) {
        JSON.parse(window.localStorage.recentMeetings).forEach((m,i) => {
            if (m.indexOf('://') > -1) {
              document.getElementById(`recent_${i+1}`).innerHTML = m.substr(m.lastIndexOf('/') + 1);
              document.getElementById(`recent_${i+1}`).href = m;
            } else {
              document.getElementById(`recent_${i+1}`).innerHTML = m;
              document.getElementById(`recent_${i+1}`).href = `https://hangouts.google.com/hangouts/_/${domain}/${m}` 
            }
            document.getElementById(`recent_${i+1}`).addEventListener('click', clickHandler, false);
        });
    }
    document.querySelectorAll('a').forEach(a=>{
        a.addEventListener('click', clickHandler, false);
    });
}
var addRecentMeeting = (meeting, callback) => {
    if (window.localStorage.recentMeetings && meeting != JSON.parse(window.localStorage.recentMeetings)[0]) {
        var newMeetings = [];
        newMeetings.push(meeting, JSON.parse(window.localStorage.recentMeetings)[0]);
        window.localStorage.setItem('recentMeetings', JSON.stringify(newMeetings));
    } else {
        window.localStorage.setItem('recentMeetings', JSON.stringify([meeting]));
    }
    recentMeetings();
    if (callback)
        callback();
}
var keyDownHandler = e => {
    if (e.altKey && e.target.href && e.target.href.indexOf('hangouts/_' > -1))
      e.target.href = e.target.href.replace('hangouts/_', 'present');
  
    if (e.target.id.indexOf('event_') > -1 && e.keyCode == 13) {
        e.preventDefault();
        addRecentMeeting(
            e.target.href,
            () => {window.location = e.target.href}
        );
    }
    if (e.target.id.indexOf('recent_') > -1 && e.keyCode == 13) {
        e.preventDefault();
        addRecentMeeting(
            e.target.href,
            () => {window.location = e.target.href}
        );
    }
}
var keyHandler = e => {
    if (e.target.id == "start" && e.keyCode == 13 && document.getElementById('start').value) {
        addRecentMeeting(
            `https://hangouts.google.com/hangouts/_/${domain}/${document.getElementById('start').value}`,
            () => {
              window.location = e.altKey ?
                `https://hangouts.google.com/present/${domain}/${document.getElementById('start').value}` : 
                `https://hangouts.google.com/hangouts/_/${domain}/${document.getElementById('start').value}`;
                  }
        );
    }

    var back = e.keyCode == 38 || e.keyCode == 37; // up, left
    var fwd = e.keyCode == 40 || e.keyCode == 39; // down, right

    if ((back || fwd)) {

        if (items.indexOf(e.target.id) > -1) {
            var targetFound = false;
            var current = items.indexOf(e.target.id);

            while (!targetFound) {
                if (back) { current-- } else { current++ }
                current = current > (items.length - 1) ? 0 : current;
                current = current < 0 ? (items.length - 1) : current;
                if (
                    document.getElementById(items[current]) &&
                    (
                        document.getElementById(items[current]).innerHTML ||
                        items[current] == 'start'
                    )
                ) {
                    targetFound = document.getElementById([items[current]]);
                }
            }
            document.getElementById(items[current]).focus();
        } else {
            document.getElementById('start').focus();
        }
    }

};
window.addEventListener('keyup', keyHandler)
window.addEventListener('keydown', keyDownHandler)

fetch('/bg').then(response => {
    return response.json();
}).then(function(img) {
    var bg = img[0].urls.raw;
    var bgStr = `url('${bg}')`;
    var bgEl = document.getElementById('bg');
    bgEl.style.background = bgStr;
    bgEl.style.backgroundSize = 'cover';
    bgEl.style.backgroundRepeat = 'no-repeat';
});
var clockUpdate = () => {
    document.querySelector('.time').innerHTML = moment().format('h:mm');
    document.querySelector('.ampm').innerHTML = moment().format('a');
    document.querySelector('.date').innerHTML = moment().format('ddd, MMM D');
    fetch(`/data?c=${encodeURIComponent(window.location.hash.substr(1))}`).then(response => {
      return response.json();
    }).then(function(data) {
        domain = data.domain;
        var validEvents = [];
        var localOffset = -(new Date().getTimezoneOffset() / 60);
      
        data.events.forEach(event => {
            var offset = 0;
            var utcCheck = /UTC([\+-][0-9].)/g.exec(event.DTSTART.params[0].TZID);
            if (utcCheck) {
              offset = localOffset - parseInt(utcCheck[1])
            } else if (timezones.find(t=>{return t.value == event.DTSTART.params[0].TZID})) {
              var timezone = timezones.find(t=>{return t.value == event.DTSTART.params[0].TZID});
              offset = localOffset - timezone.offset + (timezone.isdst ? 1 : 0);
            }
          
            if (event.DTSTART.value.indexOf(':') > -1) {
                event.DTSTART.value = event.DTSTART.value.split(':')[1]
            }
            if (event.DTEND.value.indexOf(':') > -1) {
                event.DTEND.value = event.DTEND.value.split(':')[1]
            }
            if (offset) {
              event.DTSTART.value = moment(event.DTSTART.value).add(offset, "hours");
              event.DTEND.value = moment(event.DTEND.value).add(offset, "hours");
            }            
            if (
                moment(event.DTEND.value).unix() > moment().unix() &&
                moment(event.DTEND.value).unix() < moment().endOf('day').unix()
            ) {
                validEvents.push(event);
            } else if (event.RRULE) {
                //rrule processing
                var rule = rrulestr(event.RRULE, {
                    dtstart: moment(event.DTSTART.value).toDate()
                });
                var validDates = rule.between(moment().startOf('hour').add(offset - 0.016,"hours").toDate(), moment().endOf('day').add(offset,"hours").toDate());
                if (validDates.length > 0) {
                    event.DTSTART.value = validDates[0];
                    validEvents.push(event);
                }
            }
        });
        var displayedEvents = validEvents.sort((a,b) => {
            var firstTime = moment(a.DTSTART.value);
            var secondTime = moment(b.DTSTART.value);
            return secondTime.isBefore(firstTime);
        }).slice(0,3);
        if (displayedEvents.length > 0) {
            for (var i=0; i<3; i++) {
                if (displayedEvents[i]) {
                    if (document.getElementById('list_status')) {
                        document.getElementById('meeting_list').innerHTML = '';
                    }
                    var rgx = new RegExp('(?:https?:\/\/hangouts.google.com\/hangouts\/_\/' + data.domain + '\/)([a-zA-Z-]+)', 'g');
                    var callRegex = rgx.exec(displayedEvents[i].DESCRIPTION);
                    var callName = '';
                    var callUrl = '';
                    if (callRegex) {
                      callName = callRegex[1];
                      callUrl = `https://hangouts.google.com/hangouts/_/${data.domain}/${callName}`;
                    } else {
                      data.patterns.forEach(pattern => {
                        if (!callName) {
                          rgx = new RegExp('(https?://' + pattern + '[^>\\\\(\\n)]*)', 'g');
                          var patternCheck = rgx.exec(displayedEvents[i].DESCRIPTION);
                          if (patternCheck) {
                            callName = patternCheck[1].substr(patternCheck[1].lastIndexOf('/') + 1);
                            callUrl = patternCheck[1];
                          }
                        }
                      });
                    }
                    if (!callName) {
                      var arr1 = displayedEvents[i].SUMMARY.split(' ');
                      var arr2 = [];
                      arr1.forEach(word => {
                        if (arr2.join('-').length < 8)
                          arr2.push(word.replace(/\W+/g, "").toLowerCase());
                      });
                      callName = arr2.join('-');
                      callUrl = `https://hangouts.google.com/hangouts/_/${data.domain}/${callName}`;
                    }
                    var minLeft = Math.floor(-moment.duration(moment().diff(moment(displayedEvents[i].DTSTART.value))).asMinutes());
                    var callTime = moment(displayedEvents[i].DTSTART.value).format('h:mma');
                    var callDuration = `${moment(displayedEvents[i].DTSTART.value).format('h:mma')} - ${moment(displayedEvents[i].DTEND.value).format('h:mm a')}`

                    if (document.getElementById(`event_${i+1}`)) {
                        var a = document.getElementById(`event_${i+1}`);
                        var t = document.querySelector(`#event_${i+1} .event_time`);
                        var d = document.querySelector(`#event_${i+1} .event_description`);
                        var r = document.querySelector(`#event_${i+1} .event_room`);
                        var z = document.querySelector(`#event_${i+1} .event_duration`);
                        if (a.href != callUrl) { a.href = callUrl; }
                        if (t.innerHTML != callTime) { t.innerHTML = callTime; }
                        if (
                            d.innerHTML != displayedEvents[i].SUMMARY ||
                            r.innerHTML != callName ||
                            z.innerHTML != callDuration
                        ) {
                            d.innerHTML = displayedEvents[i].SUMMARY
                            z = document.createElement('div');
                            z.className = 'event_duration';
                            z.innerHTML = callDuration;
                            d.appendChild(z);
                            r = document.createElement('div');
                            r.className = 'event_room';
                            r.innerHTML = callName;
                            d.appendChild(r);
                        }
                        if (minLeft <= 15) {
                            var m = document.querySelector(`#event_${i+1} .minLeft`)
                            if (m) {
                                m.innerHTML = minLeft > 0 ? `${minLeft}m` : 'Now';
                                if (minLeft < 0)
                                    m.classList.add('-now');
                            } else {
                                var m = document.createElement('div');
                                m.className = 'minLeft';
                                m.innerHTML = minLeft > 0 ? `${minLeft}m` : 'Now';
                                if (minLeft < 0)
                                    m.classList.add('-now');
                                a.appendChild(m);
                            }
                        }
                        if (i==0) {
                            if (minLeft < 15) {
                              clearScreenSaver();  
                              document.getElementById('event_1').focus();
                            } else {
                              if (!inactiveTimer) {
                                setInactiveTimer();
                              }
                            }
                        }
                    } else {
                        var a = document.createElement('a');
                        a.href = callUrl
                        a.id = `event_${i+1}`;
                        var t = document.createElement('div');
                        t.className = 'event_time';
                        t.innerHTML = callTime;
                        var d = document.createElement('div');
                        d.className = 'event_description';
                        d.innerHTML = displayedEvents[i].SUMMARY;
                        var r = document.createElement('div');
                        r.className = 'event_room';
                        r.innerHTML = callName;
                        var z = document.createElement('div');
                        z.className = 'event_duration';
                        z.innerHTML = callDuration;

                        if (minLeft <= 15) {
                            var m = document.createElement('div')
                            m.className = 'minLeft';
                            m.innerHTML = minLeft > 0 ? `${minLeft}m` : 'Now';
                            if (minLeft < 0)
                                m.classList.add('-now');
                            a.appendChild(m);
                        }
                        a.appendChild(t);
                        a.appendChild(d);
                        d.appendChild(z);
                        d.appendChild(r);
                        document.getElementById('meeting_list').appendChild(a);
                        if (i==0) {
                            if (minLeft < 15) {
                              clearScreenSaver();  
                              document.getElementById('event_1').focus();
                            } else {
                              document.getElementById('start').focus();
                              if (!inactiveTimer) {
                                setInactiveTimer(); 
                              }
                            }
                        }
                    }
                } else {
                    if (document.querySelectorAll('#meeting_list a')[i]) {
                        document.querySelectorAll('#meeting_list a')[i].remove();
                    }
                }
                recentMeetings();
            }
        } else {
            document.getElementById('meeting_list').innerHTML = '<a id="list_status">Nothing scheduled</a>';
            recentMeetings();
            setInactiveTimer(); 
        }
    });
};
window.setTimeout(() => {
    window.setInterval(clockUpdate, 60000);
    clockUpdate();
}, (60 - moment().seconds())*1000);
clockUpdate();
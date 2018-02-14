# hangoutlook				

![demo gif](https://i.imgur.com/Y1TZ3lK.gif)

Once upon a time, there was a company.  And the company ran Gsuite and used
Google Hangouts and all was well. Hangout boxes setup in the conference rooms displayed upcoming schedules & let you connect to calls. 

But then the company was acquired and had to switch to Outlook, and there was felt a great disturbance in the force, as if millions of meetings suddenly cried out in terror and were suddenly silenced. Outlook meeting room calendars could not connect to the Hangout boxes, and conference rooms were in chaos.

Hangoutlook was created as a solution to this chaos.  It parses an ICS calendar URL and displays a meeting room screen which looks and acts exactly like Hangouts, with some added bonuses:
* Parses Google Hangout URLs, as well as custom URL patterns for other call URLs
* Generates a meeting name if there's none specified
* Works with anything that can generate an ICS file
* Alt-click meetings to join them in present mode
* Awesome backgrounds from Unsplash
* Open-source
* Chrome OS compatible - Use [hangoutlook-redirector](http://github.com/webrender/hangoutlook-redirector) to monitor & redirect hangouts -> hangoutlook

## How to use

Visit [http://hangoutlook.glitch.me/#YOUR-ICS-URL](http://hangoutlook.glitch.me/#YOUR-ICS-URL) - that's it. 

## How to run your own copy

Visit [https://glitch.com/~hangoutlook](https://glitch.com/~hangoutlook) and remix the project. (or, clone the repo and run it yourself).

Specify the environment variables:
* `UNSPLASH_CLIENT_ID`: get an unsplash ID from unsplash.com to load background images.
* `GOOGLE_DOMAIN`: your organization's google domain
* `CALL_URL_PATTERNS`: a comma separated list of strings which match 3rd party call URLs. 
  * Example: `"bluejeans.com,appear.in,meet.lync.com,zoom.us/j/"`

If you're using glitch you should now be able to see your app at [http://yourglitchproject.glitch.me](http://yourglitchproject.glitch.me)

If you're running the app locally you'll want to run `npm install` to setup dependencies.  After that, you can start the app using `PORT=8000 node server.js`, after which you should be able to visit [http://localhost:8000](http://localhost:8000) to view it.
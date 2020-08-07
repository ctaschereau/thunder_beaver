# thunder_beaver

Using the API docs from either https://www.teslaapi.io/  or  https://tesla-api.timdorr.com/

### To run :
deno run --allow-read --allow-write --allow-net --allow-run ./src/main.ts 
Read/write permissions are to allow reading/writing the access token file and the vehicle list file.
Net permission is to be able to call the Tesla API.
Run permission is to allow notifications to be displayed when turning on the climate control.


### TODOs
- Daemon mode?
- Storing the access key and vehicle list in the user's profile
- Support for multiple vehicles
- Command to clear stored access tokens

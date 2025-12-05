# Docker

## Services and ports
| Service  | Port | Link |
| ------------- | ------------- | ------------- |
| Explorer      | 8080     | http://localhost:8080     |
| API Server      | 8081     | http://localhost:8081     |
| Metabase      | 8082     | http://localhost:8082     |
| phpMyAdmin      | 8083     | http://localhost:8083     |

## API Server
To use accurate location information instead of sample location information, set the build argument to ```REACT_APP_USE_SAMPLE_LOCATION_INFO: 0``` in the file located at ```services/docker-compose.yml```

## Metabase
### Credentials
Email: **yprov@unitn.it**

Password: **yprov123**

### Sample data
To prevent the dashboard from using sample data, delete the file located at ```services/database/init/1-sample.sql```

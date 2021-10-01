## Description
Сервис на express js<br/>
Routes:<br/>
https://praetorium.loc:8086/start - принимает ссылку на rtmp стрим и начинает<br/>
конвертировать его на mpeg и вещает по сокету wss://praetorium.loc:9997

## Requirements
- docker
- docker-compose

## Run
- docker-compose up --bu -d
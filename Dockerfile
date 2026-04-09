#base image using Node 20 on Alpine Linux  
FROM node:20-alpine
 
#langs for úer's code execution | js(itself), python, php, ruby
RUN apk add --no-cache python3 php ruby

# main folder 
WORKDIR /usr/src/app

#package.json and dependencies  
COPY package*.json ./
RUN npm install

COPY . .

#expose port  
EXPOSE 3000

#start command
CMD ["npm", "start"]
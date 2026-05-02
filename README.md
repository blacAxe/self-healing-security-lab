# Self Healing OWASP Top 5 Security Lab

Interactive security lab that demonstrates real world web attacks and their secure fixes

An interactive backend security lab built with Node.js that demonstrates how common web vulnerabilities work and how to fix them.

## Live Demo

https://self-healing-security-lab.onrender.com

## What this project is

This project simulates real world web vulnerabilities and allows switching between vulnerable mode and secure mode.

Each module shows both how an attack works and how proper backend code prevents it.

## Vulnerabilities covered

* SQL Injection
* Cross Site Scripting XSS
* Insecure Direct Object Reference IDOR
* Authentication Failures
* Security Misconfiguration

## How it works

Each vulnerability has two paths

* Vulnerable implementation that can be exploited
* Secure implementation that applies proper mitigation

You can toggle between both modes directly in the UI.

## Tech stack

* Node.js
* Express
* EJS
* MySQL Aiven managed database
* Bcrypt
* Docker
* Jest for testing
* GitHub Actions for CI

## Key features

* Interactive vulnerability demonstrations
* Secure vs insecure backend logic
* Input validation and sanitization
* Automated test suite
* Dockerized setup
* Continuous integration pipeline

## Run locally

Install dependencies

npm install

Start the server

npm start

## Run with Docker

docker compose up --build

## Run tests

npm test

## Project structure

app
controllers and routes

views
frontend templates

tests
automated test cases

## What I learned

* How common web attacks actually work
* How to design secure backend systems
* How to write testable code
* How to containerize applications with Docker
* How to set up CI pipelines

## Next improvements

* Add authentication with sessions or JWT
* Add request logging and monitoring
* Build a small dashboard for security events
* Expand with more advanced attack scenarios

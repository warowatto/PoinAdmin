import requests as req
import json 

host = 'http://localhost:3000/super/'

def allSellList():
    return req.get(host + 'all/company').json()

def singleCompanyDashboard():
    return req.get(host + 'company/1/sell').json()

print(singleCompanyDashboard())
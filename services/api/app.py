from flask import Flask
from flask_cors import CORS
import logs, reducer


app=Flask(__name__)
CORS(app)
app.config["JSON_AS_ASCII"]=False


# Status
@app.get("/")
def status():
  return {
    "status": "ok"
  }


# Error handler
# https://flask.palletsprojects.com/en/3.0.x/errorhandling/
@app.errorhandler(400)
@app.errorhandler(404)
@app.errorhandler(405)
@app.errorhandler(415)
@app.errorhandler(500)
def error(error):
  if error.code==400:
    message="Bad Request"

  elif error.code==404:
    message="Invalid URL"
  
  elif error.code==405:
    message="Method Not Allowed"

  elif error.code==415:
    message="Unsupported Media Type"

  elif error.code==500:
    message="Internal Server Error"

  return {
    "error": message
  }, error.code


# Create visit log entry
@app.post("/visit_logs")
def create_visit_log():
  return logs.create_visit_log()

# Create upload log entry
@app.post("/upload_logs")
def create_upload_log():
  return logs.create_upload_log()

# Location test
@app.get("/location")
def location_test():
  return {
    "ip": "35bd:f4f6:81da:6667:dfdd:17a9:c300:6c59",
    "city": "Milan",
    "region": "Lombardy",
    "country": "IT"
  }

# Reduce a graph
@app.post("/reducer")
def reduce_graph():
  return reducer.reduce_graph()

# Serve a graph file
@app.get("/files/<id>/<level>")
def serve_graph_file(id, level):
  return reducer.serve_graph_file(id, level)

# Delete a file folder
@app.delete("/files/<id>")
def delete_file_folder(id):
  return reducer.delete_file_folder(id)


# Start server
if __name__=="__main__":
	app.run(host="0.0.0.0", port=8000)

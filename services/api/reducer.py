from flask import request, send_from_directory
import uuid, os, subprocess, shutil, json


def reduce_graph():
  # generate uuid
  id=str(uuid.uuid4())

  temp_folder_path=os.path.join("temp-output", id)
  os.mkdir(temp_folder_path)
  temp_output_folder_path=os.path.join(temp_folder_path, "output")
  graph_file_path=os.path.join(temp_folder_path, "file.json")
  props_file_path=os.path.join(temp_folder_path, "props.txt")


  # get the request data
  # check if props file was provided
  if "graph_file" in request.files:
    request.files["graph_file"].save(os.path.join(graph_file_path))
  else:
    delete_temp_folder(temp_folder_path)

    return {
      "error": "Invalid graph file"
    }, 400

  # check if props file was provided
  if "props_file" in request.files:
    props=True
    request.files["props_file"].save(os.path.join(props_file_path))
  else:
    props=False
  
  if request.form.get("options"):
    options=json.loads(request.form.get("options"))
  else:
    delete_temp_folder(temp_folder_path)

    return {
      "error": "Invalid options"
    }, 400


  # reduce graph with yProvTools
  # build command
  cmd=["python3", "reducer_tool/reducer.py", "-o", temp_output_folder_path]

  # add options
  valid_options={
    "entity_based": "-e",
    "line_tracking": "-l",
    "chunked": "-c",
    "reduce_io": "-i"
  }
  for option, enable in options.items():
    if option in valid_options:
      if enable:
        cmd.append(valid_options[option])

  # add props option
  if props:
    cmd.append("-p")
    cmd.append(props_file_path)

  # add graph file path to command
  cmd.append(graph_file_path)


  # run command
  try:
    # run the script in subprocess
    result=subprocess.run(
      cmd,
      capture_output=True,
      text=True,
      check=False
    )

    response={
      "returncode": result.returncode,
      "stdout": result.stdout,
      "stderr": result.stderr
    }

    # command fails
    if result.returncode!=0:
      # print(json.dumps(response))

      delete_temp_folder(temp_folder_path)

      return {
        "error": "Reducer failed, try changing the options."
      }, 500
    
    # success
    else:
      # count how many files were created
      count=len([name for name in os.listdir(temp_output_folder_path) if os.path.isfile(os.path.join(temp_output_folder_path, name))])

      return {
        "uuid": id,
        "count": count
      }

  # error
  except Exception as e:
    delete_temp_folder(temp_folder_path)

    return {
      "error": str(e)
    }, 500

def serve_graph_file(id, level):
  temp_folder_path=os.path.join("temp-output", id)
  temp_output_folder_path=os.path.join(temp_folder_path, "output")
  file_name="file_%s.json" % (level)
  file_path=os.path.join(temp_output_folder_path, file_name)

  if os.path.exists(file_path):
    # https://stackoverflow.com/questions/20646822/how-to-serve-static-files-in-flask
    return send_from_directory(temp_output_folder_path, file_name)
  
  else:
    return {
      "error": "Invalid id"
    }, 400

def delete_file_folder(id):
  temp_folder_path=os.path.join("temp-output", id)

  if not os.path.exists(temp_folder_path):
    return {
      "error": "Invalid id"
    }, 400
  else:
    delete_temp_folder(temp_folder_path)

    return {
      "success": True
    }

def delete_temp_folder(path):
  if os.path.exists(path):
    shutil.rmtree(path)

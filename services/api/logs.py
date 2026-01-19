from flask import request
import uuid, mysql.connector, os, hashlib


def create_visit_log():
  # get the request data
  data=request.json

  ip=data.get("ip") if data.get("ip") else None
  country=data.get("country") if data.get("country") else None
  region=data.get("region") if data.get("region") else None
  city=data.get("city") if data.get("city") else None
  user_agent=data.get("user_agent") if data.get("user_agent") else None
  browser=data.get("browser") if data.get("browser") else None
  os=data.get("os") if data.get("os") else None
  device=data.get("device") if data.get("device") else None

  # generate uuid
  id=str(uuid.uuid4())

  # generate unique visitor hash
  value=str(ip)+str(user_agent)
  unique_visitor_hash=hashlib.sha256(value.encode("utf-8")).hexdigest()

  # connect to database
  database=get_database()
  cursor=database.cursor(buffered=True)

  # add log
  cursor.execute("""
    INSERT INTO visit_logs
    (uuid, unique_visitor_hash, country, region, city, browser, os, device)
    VALUES
    (%s, %s, %s, %s, %s, %s, %s, %s)
  """
    , (id, unique_visitor_hash, country, region, city, browser, os, device)
  )
  database.commit()

  return {
    "uuid": id
  }


def create_upload_log():
  # get the request data
  data=request.json

  visit_log_uuid=data.get("visit_log_uuid") if data.get("visit_log_uuid") else None
  name=data.get("name") if data.get("name") else None
  size=data.get("size") if data.get("size") else None

  if visit_log_uuid is None or name is None or size is None:
    return {
      "error": "Invalid data"
    }, 400

  # connect to database
  database=get_database()
  cursor=database.cursor(buffered=True)

  # add log
  cursor.execute("""
    INSERT INTO upload_logs
    (visit_log, name, size)
    VALUES
    ((SELECT id FROM visit_logs WHERE uuid=%s), %s, %s)
  """
    , (visit_log_uuid, name, size)
  )
  database.commit()

  return {
    "success": True
  }


def get_database():
  database=mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database="yprov"
  )

  return database

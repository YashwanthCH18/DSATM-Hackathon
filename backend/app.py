from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

# Import routes (after db to avoid circular imports)
# from routes.api import *

if __name__ == '__main__':
    app.run(debug=True)
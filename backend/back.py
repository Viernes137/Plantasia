from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def vida():
    return ("Si sirve la api")

@app.route('/Plantas', methods=['GET'])
def Plantas():
    datos = ""
    return jsonify(datos)

@app.route('/conexiones', methods=['GET'])
def conex_esp32():
    #aun no se me ocurre nada 
    return jsonify()



if __name__ == '__main__':
    app.run(debug=True, port=5000)
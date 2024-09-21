from flask import Blueprint, render_template, request , flash, url_for, redirect, jsonify, current_app, session, Response
from .models import User, Note, Count, Count_anonymous
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from flask_login import login_user, login_required, logout_user, current_user
import pandas as pd
import asyncio

from . import create_app
from website.core.run_agent import get_ai_response, get_full_response, get_user_responses
import traceback
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from website.core.run_agent import get_ai_response, get_full_response, get_user_responses
import traceback
from website.core.state_graph import customer_support
import json
import time
from openai import OpenAI

client = OpenAI()




auth = Blueprint('auth', __name__)



@auth.route('/login',methods= ['POST','GET'] )
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email= email).first()
        if user:
            if check_password_hash(user.password, password):
                flash('log in succesfolu', category='sucess')
                login_user(user, remember=True)#if server running user is logged
                
                return render_template('home.html', user = current_user)
            else:
                flash('incoret password', category='error')
        else:
            flash('eail does not exist', category='error')
        
    return render_template('login.html', user=current_user)


@auth.route('/logout', methods= ['POST', 'GET'])
@login_required#dokud nejsi logged tak jsem nemuyes
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

@auth.route('/signup',methods= ['POST', 'GET'])
def signin():
    if request.method == 'POST':#when i press submit button
        email = request.form.get('email')
        first_name = request.form.get('firstName')
        password1= request.form.get('password1')
        password2= request.form.get('password2')
        
        user = User.query.filter_by(email= email).first()
        
        # if info is valid
        if user:
            flash('email alreade exist', category='error')
        elif len(email) < 4:
            flash('email must be greater than four charakters', category='error')
        elif len(first_name) <2:
            flash('there must be at least 3 charakters', category='error')
        elif password1 != password2:
            flash('eamil arent same', category='error')
        elif len(password1) <7:
            flash('password must be at least 8 charakters', category='error')
        else:
            new_user = User(email=email, first_name=first_name, password = generate_password_hash(password1, method='pbkdf2:sha256'))
            db.session.add(new_user)
            db.session.commit()
            flash('account craeted!!', category='success')
            login_user(new_user, remember=True)#if server running user is logged
            new_u = Count(data=1, user_id= current_user.id)
            db.session.add(new_u)
            db.session.commit()
            return render_template('home.html', user=current_user)
            
    return render_template('signup.html', user=current_user)





@auth.route('/api/chat', methods=['POST']) 
def chat(): 
    try:
        user_message = request.json.get('message')
        print(f'Received message: {user_message}')
        if str(current_user)[1] == 'U':
            thread_id  = current_user
        else: thread_id = session['user_id']
        
        def generate():
            from website.core.config import llm_main
            stream = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": 'hi'}],
                stream=True
            )  
            print(stream)
            response = get_user_responses([user_message], thread_id=thread_id)
            
            
            
        
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    print(chunk.choices[0].delta.content,'/')
                    yield(chunk.choices[0].delta.content)
                    time.sleep(0.1)
        return generate(), {"Content-Type": "text/plain"}

        
    except Exception as e:
        print(f'Error occurred: {e}')
        print(f'Error traceback: {traceback.format_exc()}')
        return jsonify({'response': 'An error occurred'}), 500


            
            
                 
            

@auth.route('/home', methods=['GET', 'POST'])
def home():
     return render_template('home.html', user=current_user)
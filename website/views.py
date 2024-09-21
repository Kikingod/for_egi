from flask import Blueprint, render_template, session
from flask_login import  login_required, current_user
import uuid
from .models import Count_anonymous
from . import db

views = Blueprint('views', __name__)

@views.route('/')
def home():
    if 'has_visited' not in session:
        session['user_id'] = str(uuid.uuid4())
        session['has_visited'] = True
        new_user = Count_anonymous(data = 1, user_id=session['user_id'])
        db.session.add(new_user)
        db.session.commit()
        print('new user appended')
        print(f'Welcome, new user! Your session ID is {session["user_id"]}')
    else:
        print(f'Welcome back! Your session ID is {session["user_id"]}')
    
        
    
    
    return render_template('login.html', user=current_user)

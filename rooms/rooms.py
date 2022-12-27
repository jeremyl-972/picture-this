from flask import Blueprint, render_template, redirect, flash, url_for, request

rooms = Blueprint("rooms", __name__, static_folder="static",
                  template_folder="templates")


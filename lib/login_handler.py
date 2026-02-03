# -*- coding: utf-8 -*-
#********************************************************************
# ZYNTHIAN PROJECT: Zynthian Web Configurator
#
# Login Handler
#
# Copyright (C) 2017 Fernando Moyano <jofemodo@zynthian.org>
#
#********************************************************************
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation; either version 2 of
# the License, or any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# For a full copy of the GNU General Public License see the LICENSE.txt file.
#
#********************************************************************

import os
import logging
import tornado.web
from collections import OrderedDict

#------------------------------------------------------------------------------
# Login Handler
#------------------------------------------------------------------------------

class LoginHandler(tornado.web.RequestHandler):

    def get(self, errors=None):
         # Automatically log in the user
        self.set_secure_cookie("user", "root")
        self.redirect("/")

        # self.render("config.html", info={}, body="login_block.html", title="Login", config=None, errors=errors)

    def post(self):
        # Automatically log in the user on POST as well
        self.set_secure_cookie("user", "root")
        self.redirect("/")        
        # input_passwd = self.get_argument("PASSWORD")
        # try:
        #     input_passwd = self.get_argument("PASSWORD")
        #     user_passwd_enc = spwd.getspnam("root")[1]
        #     input_passwd_enc = crypt.crypt(input_passwd, user_passwd_enc)
        #     logging.debug("PASSWD: %s <=> %s" % (input_passwd_enc, user_passwd_enc))
        #     if input_passwd_enc == user_passwd_enc:
        #         self.set_secure_cookie("user", "root")
        #         if self.get_argument("next", ""):
        #             self.redirect(self.get_argument("next"))
        #         else:
        #             self.redirect("/")
        #     else:
        #         self.get({"PASSWORD": "Incorrect Password"})
        # except Exception as e:
        #     logging.error(e)
        #     self.get({"PASSWORD": "Authentication Failure"})


class LogoutHandler(tornado.web.RequestHandler):
    def get(self):
        self.clear_cookie('user')
        self.redirect(self.get_argument('next', '/'))

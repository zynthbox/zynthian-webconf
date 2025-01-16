# -*- coding: utf-8 -*-
#********************************************************************
# ZYNTHIAN PROJECT: Zynthian Web Configurator
#
# Jucy VST3 Plugins Manager Handler
#
# Copyright (C) 2018 Markus Heidt <markus@heidt-tech.com>
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

import logging
import tornado.web

from collections import OrderedDict
from lib.zynthian_config_handler import ZynthianBasicHandler

import zyngine.zynthian_vst3 as zynthian_vst3


#------------------------------------------------------------------------------
# Jucy VST3 Configuration
#------------------------------------------------------------------------------

class JucyVst3Handler(ZynthianBasicHandler):

    @tornado.web.authenticated
    def get(self, errors=None):
        config=OrderedDict([])
        config['ZYNTHIAN_JUCY_PLUGINS'] = zynthian_vst3.get_plugins_by_type()

        try:
            config['ZYNTHIAN_ACTIVE_TAB'] = self.get_argument('ZYNTHIAN_ACTIVE_TAB')
        except:
            pass

        if not 'ZYNTHIAN_ACTIVE_TAB' in config or len(config['ZYNTHIAN_ACTIVE_TAB']) == 0:
            config['ZYNTHIAN_ACTIVE_TAB'] = zynthian_vst3.PluginType.MIDI_SYNTH.value.replace(" ", "_")

        try:
            config['ZYNTHIAN_JUCY_FILTER'] = self.get_argument('ZYNTHIAN_JUCY_FILTER')
        except:
            config['ZYNTHIAN_JUCY_FILTER'] = ''

        if errors:
            logging.error("Configuring JUCY VST3-Plugins  failed: {}".format(errors))
            self.clear()
            self.set_status(400)
            self.finish("Configuring JUCY VST3-Plugins failed: {}".format(errors))
        else:
            super().get("jucy_vst3.html", "VST3-Plugins", config, errors)


    @tornado.web.authenticated
    def post(self):
        action = self.get_argument('ZYNTHIAN_JUCY_ACTION')
        if action:
            errors = {
                'ENABLE_PLUGINS': lambda: self.do_enable_plugins(),
                'REGENERATE_PLUGIN_LIST': lambda: self.do_regenerate_vst3_cache()
            }[action]()
        self.get(errors)


    def do_enable_plugins(self):
        try:
            postedPlugins = tornado.escape.recursive_unicode(self.request.arguments)

            for name, properties in zynthian_vst3.plugins.items():
                if "ZYNTHIAN_JUCY_ENABLE_{}".format(name) in postedPlugins:
                    zynthian_vst3.plugins[name]['ENABLED'] = True
                else:
                    zynthian_vst3.plugins[name]['ENABLED'] = False

            zynthian_vst3.save_plugins()

        except Exception as e:
            logging.error("Enabling jucy plugins failed: {}".format(e))
            return format(e)


    def do_regenerate_vst3_cache(self):
        zynthian_vst3.generate_jucy_plugins_json_cache()


#------------------------------------------------------------------------------

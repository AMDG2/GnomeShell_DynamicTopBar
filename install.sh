#!/bin/bash
Parameter=$1

CHECK_COMMAND(){

 if [ ! `command -v gnome-shell-extension-tool` ]; then
     return 1
 fi

}
ENABLE(){

 gnome-shell-extension-tool -e dynamicTopBar@gnomeshell.feildel.fr

}
MAKEPROJECT() {

 make -j2

}
INSTALL() {

 case $Parameter in
   root)
       printf "\033[32m Current mode: SuperUser.\033[0m\n"
       sudo cp -r dynamicTopBar@gnomeshell.feildel.fr \
       /usr/share/gnome-shell/extensions/dynamicTopBar@gnomeshell.feildel.fr
   ;;

      *)
       printf "\033[32m Current mode: NormalUser.\033[0m\n"
       cp -r dynamicTopBar@gnomeshell.feildel.fr \
       $HOME/.local/share/gnome-shell/extensions/dynamicTopBar@gnomeshell.feildel.fr
   ;;

esac

}

 printf "\033[32m check the necessary tools ... \033[0m\n"

    CHECK_COMMAND

 if [ "$?" != "0" ]; then
     printf "\033[31m gnome-tweak-tool not found!\033[0m\n"
     exit 1
 fi

 printf "\033[32m make translation documents ... \033[0m\n"

    MAKEPROJECT

 printf "\033[32m Install the extension ... \033[0m\n"
    INSTALL

 printf "\033[32m Enabling extension ... \033[0m\n"
    ENABLE


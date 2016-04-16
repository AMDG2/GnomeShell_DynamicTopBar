#
# Build system for specification
#

SRC_DIR=dynamicTopBar@gnomeshell.feildel.fr
LOCALE_DIR=${SRC_DIR}/locale

all: translations schema

translations:
	msgfmt ${LOCALE_DIR}/cs/LC_MESSAGES/dynamicTopBar.po -o ${LOCALE_DIR}/cs/LC_MESSAGES/dynamicTopBar.mo
	msgfmt ${LOCALE_DIR}/de/LC_MESSAGES/dynamicTopBar.po -o ${LOCALE_DIR}/de/LC_MESSAGES/dynamicTopBar.mo
	msgfmt ${LOCALE_DIR}/fr/LC_MESSAGES/dynamicTopBar.po -o ${LOCALE_DIR}/fr/LC_MESSAGES/dynamicTopBar.mo
	msgfmt ${LOCALE_DIR}/pl/LC_MESSAGES/dynamicTopBar.po -o ${LOCALE_DIR}/pl/LC_MESSAGES/dynamicTopBar.mo
	msgfmt ${LOCALE_DIR}/pt_BR/LC_MESSAGES/dynamicTopBar.po -o ${LOCALE_DIR}/pt_BR/LC_MESSAGES/dynamicTopBar.mo

schema:
	glib-compile-schemas dynamicTopBar@gnomeshell.feildel.fr/schemas

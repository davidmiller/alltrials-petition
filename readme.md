
Alltrials Petition
==================

The following is a replacement petition for http://www.alltrials.net/ that attempts
to increase the performance of signing the petition by minimising the overhead and
using static markup/assets for the form.

Usage
=====

From wordpress theme templates:

```php
   <? include( $_SERVER['DOCUMENT_ROOT'] . '/wp-content/plugins/alltrials-petition/petition-form.html' ) ?>
```

Installation
============

Prerequisites
-------------

A working instance of the http://www.alltrials.net/ site.

Procedure
---------

* Extract https://github.com/davidmiller/alltrials-petition/archive/master.zip into the wordpress
plugins directory
* create a local wp-config.php that contains the database settings
* include the snippet somewhere
* Update the database schema to enforce uniqueness of emails:

```sql
ALTER TABLE wp_dk_speakup_signatures ADD UNIQUE (email);
```
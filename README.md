# QMachine

[QMachine](https://www.qmachine.org) (QM) is a web service for distributed
computing. Its design relaxes the usual requirements of a distributed computer
so far that it can be powered completely by web browsers – without installing
anything. This repository is structured as a
[superproject](https://en.wikibooks.org/wiki/Git/Submodules_and_Superprojects),
which means that cloning it requires cloning its submodules, too:

    $ git clone --recursive https://github.com/qmachine/qmachine.git

As a model for computation, QM is detailed in a recent open access paper,
[QMachine: commodity supercomputing in web browsers](http://www.biomedcentral.com/1471-2105/15/176).
That paper, which is the most
["Highly Accessed"](http://www.biomedcentral.com/about/mostviewed/) paper in
*BMC Bioinformatics* of all time, explains some of the design decisions behind
QM, demonstrates the use of QM in scientific workflows, and elaborates on some
of the future directions. The accompanying screencasts, one of which was
featured by the
[HPCwire](http://www.hpcwire.com/hpcwire/2013-03-14/qmachine_combines_hpc_with_www.html)
and
[insideHPC](http://insidehpc.com/2013/03/09/video-qmachine-commodity-supercomputing-with-web-browsers/)
news sites, are available on
[YouTube](https://www.youtube.com/playlist?list=PLwUGp_wSf5vjD5vwzj9Dhqbz-y54oALIe).
QM has also graced the front page of
[Hacker News](https://news.ycombinator.com/item?id=6095595).

The [manual](https://docs.qmachine.org) is improving steadily, and a
[project wiki](https://wiki.qmachine.org) is also available for reference.

===

| Purpose         | Status                                                                                                                                              |
|:---------------:|:---------------------------------------------------------------------------------------------------------------------------------------------------:|
| Documentation   | [![Documentation Status](https://readthedocs.org/projects/qmachine/badge/?version=latest)](https://readthedocs.org/projects/qmachine/?badge=latest) |
| Unit tests      | [![Build Status](https://travis-ci.org/qmachine/qmachine.svg?branch=master)](https://travis-ci.org/qmachine/qmachine)                               |
| Special targets | [![Build Status](https://drone.io/github.com/qmachine/qmachine/status.png)](https://drone.io/github.com/qmachine/qmachine/latest)                   |

<!--
[![Coverage Status](https://img.shields.io/coveralls/qmachine/qmachine.svg)](https://coveralls.io/r/qmachine/qmachine)
-->

<!-- vim:set syntax=markdown: -->

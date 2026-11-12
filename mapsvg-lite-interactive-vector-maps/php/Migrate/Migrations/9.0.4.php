<?php

namespace MapSVG;

return function () {

    $db = Database::get();

    \MapSVG\DataLayer\Location\EmptyLocationAddressCleanup::cleanupAll();

};

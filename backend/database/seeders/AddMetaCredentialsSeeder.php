<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class AddMetaCredentialsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add Meta App ID - store as string (will be JSON encoded automatically)
        Setting::setSystem('META_APP_ID', '1168203998665117');
        
        // Add Meta App Secret
        Setting::setSystem('META_APP_SECRET', '2a3f23199da16736e39d5dbf3dbe5efc');
        
        // Generate and add verify token if not exists
        $verifyToken = Setting::getSystem('META_VERIFY_TOKEN');
        if (!$verifyToken) {
            $token = bin2hex(random_bytes(32));
            Setting::setSystem('META_VERIFY_TOKEN', $token);
        }
        
        $this->command->info('Meta credentials added successfully!');
        $this->command->info('App ID: 1168203998665117');
        $this->command->info('App Secret: 2a3f23199da16736e39d5dbf3dbe5efc');
    }
}


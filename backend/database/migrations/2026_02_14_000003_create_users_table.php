<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->foreignId('school_id')->nullable()->constrained('schools', 'school_id')->nullOnDelete();

            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('password');

            $table->enum('role', ['student', 'adviser', 'school', 'admin']);
            $table->enum('status', ['pending', 'active', 'inactive'])->default('pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

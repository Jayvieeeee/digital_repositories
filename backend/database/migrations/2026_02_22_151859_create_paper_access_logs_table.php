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
        Schema::create('paper_access_logs', function (Blueprint $table) {
            $table->id('log_id');

            $table->unsignedBigInteger('paper_id');
            $table->unsignedBigInteger('user_id');

            $table->string('access_type');   
            $table->string('access_source'); 

            $table->timestamps();

            $table->foreign('paper_id')->references('paper_id')->on('research_papers')->onDelete('cascade');

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paper_access_logs');
    }
};

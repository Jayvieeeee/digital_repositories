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
        Schema::create('similarity_results', function (Blueprint $table) {

            $table->id('similarity_result_id');

            $table->unsignedBigInteger('source_paper_id');
            $table->unsignedBigInteger('compared_paper_id');

            $table->float('similarity_score');
            $table->timestamp('checked_at')->useCurrent();

            $table->timestamps();

            // Foreign keys
            $table->foreign('source_paper_id')->references('paper_id')->on('research_papers')->onDelete('cascade');
            $table->foreign('compared_paper_id')->references('paper_id')->on('research_papers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('similarity_results');
    }
};
